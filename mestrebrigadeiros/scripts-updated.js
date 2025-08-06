// Configuração do Supabase - SUBSTITUA PELAS SUAS CREDENCIAIS
const SUPABASE_URL = "https://gckowyxkdyshvqyjtwjb.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja293eXhrZHlzaHZxeWp0d2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTMyMDgsImV4cCI6MjA2NzgyOTIwOH0.3CiR4nFvwtd6vUnHe368nFanE79jPFmMUhIT1vJAVog"
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Variáveis globais
let categories = []
let products = []
let settings = {}
let cart = []
let currentCategory = "all"
let allAddons = []
let currentProductInDetailModal = null
let currentQuantityInDetailModal = 1
let workingDays = []
let tenantResolver = null
let currentTenant = null

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
  // Primeiro, resolver o tenant
  tenantResolver = await initializeTenantSystem(supabase)
  
  if (!tenantResolver) {
    // Se não conseguiu resolver o tenant, a página de erro já foi exibida
    return
  }
  
  currentTenant = tenantResolver.getCurrentTenant()
  
  // Continuar com a inicialização normal
  initializeApp()
  setupEventListeners()
})

// Configurar event listeners
function setupEventListeners() {
  // Botões do carrinho
  document.getElementById("clear-cart").addEventListener("click", clearCart)
  document.getElementById("checkout-btn").addEventListener("click", openCheckoutModal)

  // Formulário de checkout
  document.getElementById("checkout-form").addEventListener("submit", submitOrder)
  document.getElementById("delivery-type").addEventListener("change", toggleAddressField)
  document.getElementById("payment-method").addEventListener("change", togglePaymentSpecificFields)

  // Modais
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      this.closest(".modal").style.display = "none"
    })
  })

  // Novo pedido
  document.getElementById("new-order-btn").addEventListener("click", () => {
    document.getElementById("success-modal").style.display = "none"
    clearCart()
    window.location.reload()
  })

  // Fechar modal clicando fora
  window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none"
    }
  })

  // Botão "Adicionar ao Carrinho" do modal de detalhes do produto
  document.getElementById("add-to-cart-from-detail").addEventListener("click", () => {
    if (currentProductInDetailModal) {
      const selectedAddons = Array.from(
        document.querySelectorAll('#product-addons-list input[type="checkbox"]:checked'),
      ).map((checkbox) => {
        const addonId = Number.parseInt(checkbox.value)
        return allAddons.find((addon) => addon.id === addonId)
      })
      addToCart(currentProductInDetailModal, selectedAddons, currentQuantityInDetailModal)
      document.getElementById("product-detail-modal").style.display = "none"
    }
  })
}

// Inicializar aplicação
async function initializeApp() {
  showLoading(true)

  // Espera 3 segundos para o efeito da splash screen
  await new Promise((resolve) => setTimeout(resolve, 3000))

  try {
    await loadSettings()
    await loadWorkingDays()
    applyThemeColors()

    // Verificar se a loja está aberta
    if (!isStoreOpen()) {
      showClosedMessage()
      return
    }

    await loadCategories()
    await loadProducts()
    await loadAllAddons()

    displayStoreInfo()
    displayCategories()
    displayProducts()

    showMainContent()
  } catch (error) {
    console.error("Erro ao inicializar aplicação:", error)
    alert("Erro ao carregar o cardápio. Tente novamente.")
  } finally {
    showLoading(false)
  }
}

// Carregar configurações (modificado para multi-tenant)
async function loadSettings() {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("company_id", currentTenant.id)

    if (error) throw error

    settings = {}
    data.forEach((setting) => {
      settings[setting.key] = setting.value
    })
    
    // Ensure boolean settings are correctly parsed
    settings.store_open = settings.store_open === "true"
    settings.enable_delivery = settings.enable_delivery === "true"
    settings.enable_pickup = settings.enable_pickup === "true"
    settings.enable_table_order = settings.enable_table_order === "true"
  } catch (error) {
    console.error("Erro ao carregar configurações:", error)
    throw error
  }
}

// Carregar dias de funcionamento (modificado para multi-tenant)
async function loadWorkingDays() {
  try {
    const { data, error } = await supabase
      .from("working_days")
      .select("*")
      .eq("company_id", currentTenant.id)

    if (error) throw error
    workingDays = data || []
  } catch (error) {
    console.error("Erro ao carregar dias de funcionamento:", error)
    workingDays = []
  }
}

// Carregar categorias (modificado para multi-tenant)
async function loadCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("company_id", currentTenant.id)
      .eq("active", true)
      .order("name")

    if (error) throw error
    categories = data
  } catch (error) {
    console.error("Erro ao carregar categorias:", error)
    throw error
  }
}

// Carregar produtos (modificado para multi-tenant)
async function loadProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
                *,
                categories (name)
            `)
      .eq("company_id", currentTenant.id)
      .eq("active", true)
      .order("name")

    if (error) throw error
    products = data
  } catch (error) {
    console.error("Erro ao carregar produtos:", error)
    throw error
  }
}

// Carregar todos os acréscimos ativos (modificado para multi-tenant)
async function loadAllAddons() {
  try {
    const { data, error } = await supabase
      .from("addons")
      .select("*")
      .eq("company_id", currentTenant.id)
      .eq("active", true)
      .order("name")

    if (error) throw error
    allAddons = data
  } catch (error) {
    console.error("Erro ao carregar acréscimos:", error)
    throw error
  }
}

// Exibir informações da loja (modificado para usar dados do tenant)
function displayStoreInfo() {
  document.getElementById("store-name").textContent = currentTenant.name || "Cardápio Digital"

  const storeInfo = []
  if (currentTenant.phone) storeInfo.push(`📞 ${currentTenant.phone}`)
  if (currentTenant.address) storeInfo.push(`📍 ${currentTenant.address}`)

  document.getElementById("store-info").textContent = storeInfo.join(" • ")

  // Exibir tempos estimados de retirada e entrega
  const estimatedPickupTimeDisplay = document.getElementById("estimated-pickup-time-display")
  const estimatedDeliveryTimeDisplay = document.getElementById("estimated-delivery-time-display")

  if (estimatedPickupTimeDisplay) {
    estimatedPickupTimeDisplay.textContent = settings.estimated_pickup_time
      ? `Tempo para retirada: ${settings.estimated_pickup_time}`
      : ""
  }
  if (estimatedDeliveryTimeDisplay) {
    estimatedDeliveryTimeDisplay.textContent = settings.estimated_delivery_time
      ? `Tempo de entrega: ${settings.estimated_delivery_time}`
      : ""
  }
}

// Submeter pedido (modificado para incluir company_id)
async function submitOrder(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const deliveryType = document.getElementById("delivery-type").value
  const paymentMethod = document.getElementById("payment-method").value

  const totalAmount = Number.parseFloat(document.getElementById("checkout-total").textContent.replace(",", "."))

  const changeForAmount =
    paymentMethod === "money" ? Number.parseFloat(document.getElementById("change-for-amount").value) || 0 : 0

  const orderData = {
    company_id: currentTenant.id, // Adicionar company_id
    customer_name: document.getElementById("customer-name").value,
    customer_phone: document.getElementById("customer-phone").value,
    customer_address: document.getElementById("customer-address").value || null,
    items: JSON.stringify(cart),
    total_amount: totalAmount,
    delivery_fee: deliveryType === "delivery" ? Number.parseFloat(settings.delivery_fee || 0) : 0,
    payment_method: paymentMethod,
    delivery_type: deliveryType,
    status: "pending",
    change_for: changeForAmount > 0 ? changeForAmount : null,
  }

  // Validação do troco
  if (paymentMethod === "money" && changeForAmount > 0 && changeForAmount < totalAmount) {
    alert(
      `O valor para troco (R$ ${changeForAmount.toFixed(2).replace(".", ",")}) deve ser maior ou igual ao total do pedido (R$ ${totalAmount.toFixed(2).replace(".", ",")}).`,
    )
    document.getElementById("change-for-amount").focus()
    return
  }

  try {
    const { data, error } = await supabase.from("orders").insert([orderData]).select()

    if (error) throw error

    // Enviar para WhatsApp
    await sendToWhatsApp(orderData, data[0].id)

    // Fechar modal de checkout
    document.getElementById("checkout-modal").style.display = "none"

    // Mostrar modal de sucesso
    document.getElementById("order-number").textContent = data[0].id
    document.getElementById("success-modal").style.display = "block"

    // Salvar informações do cliente no localStorage para a próxima vez
    localStorage.setItem("lastCustomerName", orderData.customer_name)
    localStorage.setItem("lastCustomerPhone", orderData.customer_phone)
    localStorage.setItem("lastDeliveryType", orderData.delivery_type)
    if (orderData.delivery_type === "delivery" && orderData.customer_address) {
      localStorage.setItem("lastCustomerAddress", orderData.customer_address)
    } else {
      localStorage.removeItem("lastCustomerAddress")
    }

    // Limpar carrinho
    clearCart()
  } catch (error) {
    console.error("Erro ao submeter pedido:", error)
    alert("Erro ao enviar pedido. Tente novamente.")
  }
}

// Resto das funções permanecem iguais, mas agora trabalham com o contexto do tenant atual
// ... (manter todas as outras funções do scripts.js original)

// Aplicar cores do tema (modificado para usar configurações do tenant)
function applyThemeColors() {
  const header = document.querySelector(".header")
  const body = document.body

  // Usar configurações do tenant se disponíveis, senão usar configurações das settings
  const tenantSettings = tenantResolver.getTenantSettings()
  
  const headerColorStart = tenantSettings.headerColorStart || settings.header_color_start
  const headerColorEnd = tenantSettings.headerColorEnd || settings.header_color_end
  const backgroundColor = tenantSettings.backgroundColor || settings.background_color

  if (header && headerColorStart && headerColorEnd) {
    header.style.background = `linear-gradient(135deg, ${headerColorStart} 0%, ${headerColorEnd} 100%)`
  }
  if (body && backgroundColor) {
    body.style.backgroundColor = backgroundColor
  }
}

// Verificar se a loja está aberta (mantém a lógica original)
function isStoreOpen() {
  if (!settings.store_open) {
    return false
  }

  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  const openingTime = timeToMinutes(settings.opening_time || "08:00")
  const closingTime = timeToMinutes(settings.closing_time || "22:00")

  const isWithinHours = currentTime >= openingTime && currentTime <= closingTime

  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const currentDayIndex = now.getDay()
  const currentDayName = daysOfWeek[currentDayIndex]

  const todayWorkingDay = workingDays.find((day) => day.day_of_week === currentDayName)
  const isWorkingDay = todayWorkingDay ? todayWorkingDay.is_working : true

  return isWithinHours && isWorkingDay
}

// Converter horário para minutos
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number)
  return hours * 60 + minutes
}

// Exibir categorias
function displayCategories() {
  const container = document.getElementById("categories")

  const allBtn = `<button class="category-btn ${currentCategory === "all" ? "active" : ""}" onclick="filterByCategory('all')">Todos</button>`

  const categoryBtns = categories
    .map(
      (category) =>
        `<button class="category-btn ${currentCategory === category.id ? "active" : ""}" onclick="filterByCategory(${category.id})">${category.name}</button>`,
    )
    .join("")

  container.innerHTML = allBtn + categoryBtns
}

// Exibir produtos
function displayProducts() {
  const container = document.getElementById("products")

  let filteredProducts = products
  if (currentCategory !== "all") {
    filteredProducts = products.filter((product) => product.category_id === currentCategory)
  }

  if (filteredProducts.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #666; font-size: 1.2em; margin: 50px 0;">Nenhum produto encontrado nesta categoria.</p>'
    return
  }

  container.innerHTML = filteredProducts
    .map(
      (product) => `
    <div class="product-card">
        <div class="product-image">
            ${
              product.image_url
                ? `<img src="${product.image_url}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                : "🍽️"
            }
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description || ""}</p>
            <div class="product-price">R$ ${Number.parseFloat(product.price).toFixed(2).replace(".", ",")}</div>
            <button class="btn-add-cart" onclick="openProductDetailModal(${product.id})">
                Adicionar ao Carrinho
            </button>
        </div>
    </div>
`,
    )
    .join("")
}

// Filtrar por categoria
function filterByCategory(categoryId) {
  currentCategory = categoryId
  displayCategories()
  displayProducts()
}

// Abrir modal de detalhes do produto
function openProductDetailModal(productId) {
  const product = products.find((p) => p.id === productId)
  if (!product) return

  currentProductInDetailModal = product
  currentQuantityInDetailModal = 1

  document.getElementById("detail-product-name").textContent = product.name
  document.getElementById("detail-product-image").src = product.image_url || "/placeholder.svg?height=200&width=200"
  document.getElementById("detail-product-description").textContent = product.description || ""
  document.getElementById("detail-product-price").textContent = Number.parseFloat(product.price)
    .toFixed(2)
    .replace(".", ",")
  document.getElementById("detail-quantity").textContent = currentQuantityInDetailModal

  const addonsSection = document.querySelector(".addons-section")
  const addonsListContainer = document.getElementById("product-addons-list")

  if (product.has_addons) {
    addonsSection.style.display = "block"
    if (allAddons.length > 0) {
      addonsListContainer.innerHTML = allAddons
        .map(
          (addon) => `
        <label class="addon-item">
            <input type="checkbox" value="${addon.id}">
            <span>${addon.name}</span>
            <span class="addon-price">R$ ${Number.parseFloat(addon.price).toFixed(2).replace(".", ",")})</span>
        </label>
    `,
        )
        .join("")
    } else {
      addonsListContainer.innerHTML = "<p>Nenhum acréscimo disponível para este item.</p>"
    }
  } else {
    addonsSection.style.display = "none"
    addonsListContainer.innerHTML = ""
  }

  document.getElementById("product-detail-modal").style.display = "block"
}

// Atualizar quantidade no modal de detalhes do produto
function updateDetailQuantity(change) {
  currentQuantityInDetailModal += change
  if (currentQuantityInDetailModal < 1) {
    currentQuantityInDetailModal = 1
  }
  document.getElementById("detail-quantity").textContent = currentQuantityInDetailModal
}

// Adicionar ao carrinho
function addToCart(product, selectedAddons, quantity) {
  const itemHash = `${product.id}-${selectedAddons
    .map((a) => a.id)
    .sort()
    .join("-")}`

  const existingItemIndex = cart.findIndex((item) => item.hash === itemHash)

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += quantity
  } else {
    cart.push({
      id: product.id,
      hash: itemHash,
      name: product.name,
      price: Number.parseFloat(product.price),
      quantity: quantity,
      selectedAddons: selectedAddons,
    })
  }

  updateCartDisplay()
}

// Atualizar exibição do carrinho
function updateCartDisplay() {
  const cartSummary = document.getElementById("cart-summary")
  const cartItems = document.getElementById("cart-items")
  const cartTotal = document.getElementById("cart-total")

  if (cart.length === 0) {
    cartSummary.style.display = "none"
    return
  }

  cartSummary.style.display = "block"

  cartItems.innerHTML = cart
    .map((item) => {
      let addonsHtml = ""
      let itemSubtotal = item.price * item.quantity
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        addonsHtml = item.selectedAddons
          .map((addon) => {
            itemSubtotal += addon.price * item.quantity
            return `<p class="cart-addon-item">+ ${addon.name} (R$ ${addon.price.toFixed(2).replace(".", ",")})</p>`
          })
          .join("")
      }

      return `
    <div class="cart-item">
        <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>R$ ${item.price.toFixed(2).replace(".", ",")} cada</p>
            ${addonsHtml}
        </div>
        <div class="cart-item-controls">
            <button class="quantity-btn" onclick="updateQuantity('${item.hash}', -1)" ${item.quantity <= 1 ? "disabled" : ""}>-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity('${item.hash}', 1)">+</button>
        </div>
    </div>
`
    })
    .join("")

  const total = cart.reduce((sum, item) => {
    let itemTotal = item.price * item.quantity
    if (item.selectedAddons) {
      item.selectedAddons.forEach((addon) => {
        itemTotal += addon.price * item.quantity
      })
    }
    return sum + itemTotal
  }, 0)
  cartTotal.textContent = total.toFixed(2).replace(".", ",")
}

// Atualizar quantidade
function updateQuantity(itemHash, change) {
  const item = cart.find((item) => item.hash === itemHash)
  if (!item) return

  item.quantity += change

  if (item.quantity <= 0) {
    cart = cart.filter((item) => item.hash !== itemHash)
  }

  updateCartDisplay()
}

// Limpar carrinho
function clearCart() {
  cart = []
  updateCartDisplay()
}

// Abrir modal de checkout
function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio!")
    return
  }

  const modal = document.getElementById("checkout-modal")
  const deliveryTypeSelect = document.getElementById("delivery-type")

  // Limpar formulário
  document.getElementById("checkout-form").reset()
  document.getElementById("address-group").style.display = "none"
  document.getElementById("pix-info").style.display = "none"
  document.getElementById("change-info").style.display = "none"
  document.getElementById("delivery-fee-line").style.display = "none"

  // Dynamically populate delivery type options
  let optionsHtml = '<option value="">Selecione...</option>'
  let enabledOptionsCount = 0
  let firstEnabledOption = ""

  if (settings.enable_delivery) {
    optionsHtml += '<option value="delivery">Entrega</option>'
    enabledOptionsCount++
    if (!firstEnabledOption) firstEnabledOption = "delivery"
  }
  if (settings.enable_pickup) {
    optionsHtml += '<option value="pickup">Retirada</option>'
    enabledOptionsCount++
    if (!firstEnabledOption) firstEnabledOption = "pickup"
  }
  if (settings.enable_table_order) {
    optionsHtml += '<option value="table">Pedido na Mesa</option>'
    enabledOptionsCount++
    if (!firstEnabledOption) firstEnabledOption = "table"
  }
  deliveryTypeSelect.innerHTML = optionsHtml

  if (enabledOptionsCount === 1) {
    deliveryTypeSelect.value = firstEnabledOption
  } else {
    deliveryTypeSelect.value = localStorage.getItem("lastDeliveryType") || ""
  }

  if (enabledOptionsCount === 0) {
    alert("Nenhum tipo de pedido está habilitado no momento. Por favor, tente mais tarde.")
    return
  }

  // Carregar informações do cliente do localStorage
  const lastCustomerName = localStorage.getItem("lastCustomerName")
  const lastCustomerPhone = localStorage.getItem("lastCustomerPhone")
  const lastCustomerAddress = localStorage.getItem("lastCustomerAddress")

  if (lastCustomerName) {
    document.getElementById("customer-name").value = lastCustomerName
  }
  if (lastCustomerPhone) {
    document.getElementById("customer-phone").value = lastCustomerPhone
  }
  
  toggleAddressField()
  if (lastCustomerAddress) {
    document.getElementById("customer-address").value = lastCustomerAddress
  }

  displayCheckoutItems()
  modal.style.display = "block"
}

// Exibir itens no checkout
function displayCheckoutItems() {
  const container = document.getElementById("checkout-items")
  const subtotalElement = document.getElementById("checkout-subtotal")
  const deliveryFeeElement = document.getElementById("checkout-delivery-fee")
  const totalElement = document.getElementById("checkout-total")

  let currentSubtotal = 0

  container.innerHTML = cart
    .map((item) => {
      let addonsHtml = ""
      let itemPriceWithAddons = item.price
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        addonsHtml = item.selectedAddons
          .map((addon) => {
            itemPriceWithAddons += addon.price
            return `<p style="margin-left: 10px; font-size: 0.9em;">+ ${addon.name} (R$ ${addon.price.toFixed(2).replace(".", ",")})</p>`
          })
          .join("")
      }
      currentSubtotal += itemPriceWithAddons * item.quantity

      return `
      <div class="checkout-item">
          <span>${item.quantity}x ${item.name}</span>
          <span>R$ ${(itemPriceWithAddons * item.quantity).toFixed(2).replace(".", ",")}</span>
          ${addonsHtml}
      </div>
  `
    })
    .join("")

  subtotalElement.textContent = currentSubtotal.toFixed(2).replace(".", ",")
  updateCheckoutTotals()
}

// Atualizar totais do checkout
function updateCheckoutTotals() {
  const deliveryType = document.getElementById("delivery-type").value
  const subtotal = cart.reduce((sum, item) => {
    let itemTotal = item.price * item.quantity
    if (item.selectedAddons) {
      item.selectedAddons.forEach((addon) => {
        itemTotal += addon.price * item.quantity
      })
    }
    return sum + itemTotal
  }, 0)

  let deliveryFee = 0
  if (deliveryType === "delivery") {
    deliveryFee = Number.parseFloat(settings.delivery_fee || 0)
    document.getElementById("delivery-fee-line").style.display = "flex"
    document.getElementById("checkout-delivery-fee").textContent = deliveryFee.toFixed(2).replace(".", ",")
  } else {
    document.getElementById("delivery-fee-line").style.display = "none"
  }

  const total = subtotal + deliveryFee
  document.getElementById("checkout-total").textContent = total.toFixed(2).replace(".", ",")
}

// Toggle campo de endereço
function toggleAddressField() {
  const deliveryType = document.getElementById("delivery-type").value
  const addressGroup = document.getElementById("address-group")
  const addressField = document.getElementById("customer-address")

  if (deliveryType === "delivery") {
    addressGroup.style.display = "block"
    addressField.required = true
  } else {
    addressGroup.style.display = "none"
    addressField.required = false
  }

  updateCheckoutTotals()
}

// Toggle informações específicas do método de pagamento
function togglePaymentSpecificFields() {
  const paymentMethod = document.getElementById("payment-method").value
  const pixInfo = document.getElementById("pix-info")
  const pixKey = document.getElementById("pix-key")
  const changeInfo = document.getElementById("change-info")
  const changeForAmount = document.getElementById("change-for-amount")

  pixInfo.style.display = "none"
  changeInfo.style.display = "none"
  changeForAmount.required = false

  if (paymentMethod === "pix") {
    pixInfo.style.display = "block"
    pixKey.textContent = settings.pix_key || "Não configurado"
  } else if (paymentMethod === "money") {
    changeInfo.style.display = "block"
  }
}

// Enviar pedido para WhatsApp (modificado para usar dados do tenant)
async function sendToWhatsApp(orderData, orderId) {
  try {
    let message = `🛒 *NOVO PEDIDO #${orderId}*\n\n`
    message += `👤 *Cliente:* ${orderData.customer_name}\n`
    message += `📱 *Telefone:* ${orderData.customer_phone}\n`

    let deliveryTypeText = ""
    if (orderData.delivery_type === "delivery") {
      deliveryTypeText = "Entrega"
    } else if (orderData.delivery_type === "pickup") {
      deliveryTypeText = "Retirada"
    } else if (orderData.delivery_type === "table") {
      deliveryTypeText = "Pedido na Mesa"
    }
    message += `🚚 *Tipo:* ${deliveryTypeText}\n`

    if (orderData.customer_address) {
      message += `📍 *Endereço:* ${orderData.customer_address}\n`
    }

    message += `💳 *Pagamento:* ${getPaymentMethodText(orderData.payment_method)}\n`

    if (orderData.payment_method === "money" && orderData.change_for > 0) {
      const troco = orderData.change_for - orderData.total_amount
      message += `*Troco para:* R$ ${orderData.change_for.toFixed(2).replace(".", ",")}\n`
      message += `*Troco a ser dado:* R$ ${troco.toFixed(2).replace(".", ",")}\n`
    }

    if (orderData.delivery_type === "delivery" && settings.estimated_delivery_time) {
      message += `⏳ *Tempo Estimado de Entrega:* ${settings.estimated_delivery_time}\n`
    } else if (orderData.delivery_type === "pickup" && settings.estimated_pickup_time) {
      message += `⏳ *Tempo Estimado para Retirada:* ${settings.estimated_pickup_time}\n`
    }

    message += `\n`

    message += `📋 *ITENS DO PEDIDO:*\n`
    JSON.parse(orderData.items).forEach((item) => {
      let itemLine = `• ${item.quantity}x ${item.name}`
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        itemLine += ` (`
        itemLine += item.selectedAddons.map((addon) => `${addon.name}`).join(", ")
        itemLine += `)`
      }
      itemLine += ` - R$ ${(
        item.price * item.quantity +
        (item.selectedAddons ? item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0) * item.quantity : 0)
      )
        .toFixed(2)
        .replace(".", ",")}\n`
      message += itemLine
    })

    message += `\n💰 *VALORES:*\n`
    message += `Subtotal: R$ ${(orderData.total_amount - orderData.delivery_fee).toFixed(2).replace(".", ",")}\n`

    if (orderData.delivery_fee > 0) {
      message += `Taxa de Entrega: R$ ${orderData.delivery_fee.toFixed(2).replace(".", ",")}\n`
    }

    message += `*TOTAL: R$ ${orderData.total_amount.toFixed(2).replace(".", ",")}*\n\n`

    if (orderData.payment_method === "pix") {
      message += `🔑 *Chave PIX:* ${settings.pix_key}\n`
      message += `📄 *Envie o comprovante após o pagamento*\n\n`
    }

    message += `⏰ *Pedido realizado em:* ${new Date().toLocaleString("pt-BR")}\n`
    message += `🏪 *${currentTenant.name}*`

    const whatsappNumber = settings.whatsapp_number ? settings.whatsapp_number.replace(/\D/g, "") : ""

    if (whatsappNumber) {
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
      window.open(whatsappUrl, "_blank")
    } else {
      console.warn("Número do WhatsApp não configurado nas configurações do admin.")
      alert("Número do WhatsApp da loja não configurado. O pedido foi salvo, mas não enviado via WhatsApp.")
    }
  } catch (error) {
    console.error("Erro ao enviar para WhatsApp:", error)
    alert("Erro ao enviar pedido para WhatsApp. O pedido foi salvo, mas não enviado via WhatsApp.")
  }
}

// Função auxiliar para texto do método de pagamento
function getPaymentMethodText(method) {
  const methodMap = {
    pix: "PIX",
    money: "Dinheiro",
    card: "Cartão",
  }
  return methodMap[method] || method
}

// Mostrar/ocultar loading
function showLoading(show) {
  const loadingElement = document.getElementById("loading")
  if (loadingElement) {
    if (show) {
      loadingElement.classList.remove("hidden")
      loadingElement.style.display = "flex"
    } else {
      loadingElement.classList.add("hidden")
      loadingElement.addEventListener("transitionend", function handler() {
        loadingElement.style.display = "none"
        loadingElement.removeEventListener("transitionend", handler)
      })
    }
  }
}

// Mostrar mensagem de fechado
function showClosedMessage() {
  const openingHours = `${settings.opening_time || "08:00"} às ${settings.closing_time || "22:00"}`
  document.getElementById("opening-hours").textContent = openingHours
  document.getElementById("closed-message").style.display = "flex"
}

// Mostrar conteúdo principal
function showMainContent() {
  document.getElementById("main-content").style.display = "block"
}

// Formatação de moeda
function formatCurrency(value) {
  return `R$ ${Number.parseFloat(value).toFixed(2).replace(".", ",")}`
}

// Formatação de telefone
function formatPhone(phone) {
  return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")
}

// Validação de formulário
function validateForm(formId) {
  const form = document.getElementById(formId)
  const inputs = form.querySelectorAll("input[required], select[required], textarea[required]")

  for (const input of inputs) {
    if (!input.value.trim()) {
      input.focus()
      alert(`Por favor, preencha o campo: ${input.previousElementSibling.textContent}`)
      return false
    }
  }

  return true
}

// Máscara para telefone
document.addEventListener("DOMContentLoaded", () => {
  const phoneInputs = document.querySelectorAll('input[type="tel"]')

  phoneInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")

      if (value.length <= 11) {
        if (value.length <= 2) {
          value = value.replace(/(\d{0,2})/, "($1")
        } else if (value.length <= 7) {
          value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2")
        } else {
          value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
        }
      }

      e.target.value = value
    })
  })
})

// Função para debug (remover em produção)
function debugInfo() {
  console.log("Current Tenant:", currentTenant)
  console.log("Settings:", settings)
  console.log("Categories:", categories)
  console.log("Products:", products)
  console.log("Cart:", cart)
  console.log("Addons:", allAddons)
  console.log("Working Days:", workingDays)
}

// Adicionar ao escopo global para debug
window.debugInfo = debugInfo
