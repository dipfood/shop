// Configuração do Cardápio Digital com Supabase
const CONFIG = {
  empresa: {
    nome: "Paris Burger",
    logo: "/placeholder.svg?height=80&width=80",
    telefone: "(11) 99999-9999",
    endereco: "Rua das Flores, 123 - Centro",
    instagram: "@parisburguer",
    facebook: "parisburguer",
  },
  horarioFuncionamento: {
    ativo: true,
    horarios: {
      segunda: { aberto: true, abertura: "18:00", fechamento: "23:30" },
      terca: { aberto: true, abertura: "18:00", fechamento: "23:30" },
      quarta: { aberto: true, abertura: "18:00", fechamento: "23:30" },
      quinta: { aberto: true, abertura: "18:00", fechamento: "23:30" },
      sexta: { aberto: true, abertura: "18:00", fechamento: "23:30" },
      sabado: { aberto: true, abertura: "18:00", fechamento: "00:00" },
      domingo: { aberto: true, abertura: "18:00", fechamento: "23:30" },
    },
  },
  pagamento: {
    pix: {
      ativo: true,
      chave: "parisburguer@email.com",
      qrcode: "/placeholder.svg?height=200&width=200",
    },
    dinheiro: {
      ativo: true,
      troco: true,
    },
    cartao: {
      ativo: true,
      credito: true,
      debito: true,
    },
    delivery: {
      ativo: true,
      taxa: 5.0,
      tempoEntrega: "45-60 min",
    },
  },
  categorias: [
    {
      id: "burgers",
      nome: "Sanduíches",
      icone: "🍔",
      ativo: true,
    },
    {
      id: "bebidas",
      nome: "Bebidas",
      icone: "🥤",
      ativo: true,
    },
    {
      id: "porcoes",
      nome: "Porções",
      icone: "🍟",
      ativo: true,
    },
    {
      id: "sobremesas",
      nome: "Sobremesas",
      icone: "🍰",
      ativo: true,
    },
  ],
  acrescimos: [
    {
      id: 1,
      nome: "Bacon",
      preco: 3.0,
      categoria: "carnes",
      ativo: true,
    },
    {
      id: 2,
      nome: "Queijo Extra",
      preco: 2.5,
      categoria: "queijos",
      ativo: true,
    },
    {
      id: 3,
      nome: "Ovo",
      preco: 2.0,
      categoria: "extras",
      ativo: true,
    },
    {
      id: 4,
      nome: "Catupiry",
      preco: 4.0,
      categoria: "queijos",
      ativo: true,
    },
    {
      id: 5,
      nome: "Calabresa",
      preco: 3.5,
      categoria: "carnes",
      ativo: true,
    },
    {
      id: 6,
      nome: "Frango Desfiado",
      preco: 4.5,
      categoria: "carnes",
      ativo: true,
    },
    {
      id: 7,
      nome: "Alface",
      preco: 1.0,
      categoria: "vegetais",
      ativo: true,
    },
    {
      id: 8,
      nome: "Tomate",
      preco: 1.0,
      categoria: "vegetais",
      ativo: true,
    },
    {
      id: 9,
      nome: "Cebola",
      preco: 1.0,
      categoria: "vegetais",
      ativo: true,
    },
    {
      id: 10,
      nome: "Batata Palha",
      preco: 2.0,
      categoria: "extras",
      ativo: true,
    },
  ],
  categoriasAcrescimos: [
    {
      id: "carnes",
      nome: "Carnes",
      icone: "🥓",
      ativo: true,
    },
    {
      id: "queijos",
      nome: "Queijos",
      icone: "🧀",
      ativo: true,
    },
    {
      id: "vegetais",
      nome: "Vegetais",
      icone: "🥬",
      ativo: true,
    },
    {
      id: "extras",
      nome: "Extras",
      icone: "🍟",
      ativo: true,
    },
  ],
  configuracoes: {
    tema: "dark",
    mostraPrecos: true,
    permiteCarrinho: true,
    whatsappPedidos: true,
    numeroWhatsapp: "5511999999999",
  },
}

const menuItems = {
  sandwiches: [
    {
      name: "Misto Quente",
      price: 14.0,
      description: "Hambúrguer, queijo, Presunto, tomate e Maionese da Casa",
      noAddons: false,
      disponivel: true,
    },
    {
      name: "X-Burguer",
      price: 12.0,
      description: "Hambúrguer, queijo, tomate e Maionese da Casa",
      disponivel: true,
    },
    {
      name: "X-Salada",
      price: 13.0,
      description: "Hambúrguer, queijo, alface, tomate e Maionese da Casa",
      disponivel: true,
    },
    {
      name: "X-Catupiry",
      price: 18.0,
      description: "Hambúrguer, Catupiry, queijo, alface, tomate e Maionese da Casa",
      disponivel: true,
    },
    {
      name: "X-Calabresa",
      price: 17.0,
      description: "Hambúrguer, Calabresa, queijo, alface, tomate e Maionese da Casa",
      disponivel: true,
    },
    {
      name: "X-Bacon",
      price: 18.0,
      description: "Hambúrguer, Bacon, queijo, alface, tomate e Maionese da Casa",
      disponivel: true,
    },
    { name: "X-Milho", price: 14.0, description: "Hambúrguer, milho, salada e mussarela", disponivel: true },
    {
      name: "X-Egg",
      price: 14.0,
      description: "Hambúrguer, Ovo, queijo, alface, tomate e Maionese da Casa",
      disponivel: true,
    },
    {
      name: "X-Tudo",
      price: 20.0,
      description: "Hambúrguer, Queijo, bacon, calabresa, catupiry, ovo, frango, alface, tomate e Maionese da Casa",
      disponivel: true,
    },
    {
      name: "X-Pit Bull",
      price: 34.0,
      description:
        "Hambúrguer 150g, 1 Hamburguer tradicional, 2 Salsichas, Queijo, bacon, calabresa, catupiry, 2 ovos, frango, alface, tomate e Maionese da Casa",
      disponivel: true,
    },
  ],
  bebidas: [
    { name: "Refrigerante Lata", price: 5.9, description: "Coca-Cola, Guaraná, Fanta - 350ml", disponivel: true },
    { name: "Suco Natural", price: 8.9, description: "Laranja, Limão, Maracujá - 400ml", disponivel: true },
    { name: "Água Mineral", price: 3.5, description: "Água mineral 500ml", disponivel: true },
  ],
  porcoes: [
    {
      name: "Batata Frita",
      price: 18.9,
      description: "Batata rústica com casca, tempero especial - serve 2 pessoas",
      disponivel: true,
    },
    {
      name: "Onion Rings",
      price: 16.9,
      description: "Anéis de cebola empanados e fritos - 12 unidades",
      disponivel: true,
    },
    { name: "Nuggets", price: 15.9, description: "Nuggets de frango crocantes - 10 unidades", disponivel: true },
  ],
  sobremesas: [
    {
      name: "Brownie com Sorvete",
      price: 14.9,
      description: "Brownie de chocolate com sorvete de baunilha e calda",
      disponivel: true,
    },
    { name: "Petit Gateau", price: 16.9, description: "Bolinho de chocolate quente com sorvete", disponivel: true },
  ],
}

// Sistema de Administração
const ADMIN_CONFIG = {
  login: {
    usuario: "admin",
    senha: "123456", // ALTERE ESTA SENHA!
  },
}

// Função para converter menuItems para o formato usado pelo sistema
function convertMenuItemsToProducts() {
  const produtos = []
  let id = 1

  Object.keys(menuItems).forEach((categoria) => {
    menuItems[categoria].forEach((item) => {
      produtos.push({
        id: id++,
        categoria: categoria === "sandwiches" ? "burgers" : categoria,
        nome: item.name,
        descricao: item.description,
        preco: item.price,
        imagem: "/placeholder.svg?height=200&width=300",
        disponivel: item.disponivel !== undefined ? item.disponivel : true,
        destaque: item.name === "X-Pit Bull" || item.name === "X-Tudo",
        noAddons: item.noAddons || false,
      })
    })
  })

  return produtos
}

// Função para carregar configurações do Supabase
async function carregarConfiguracoes() {
  try {
    console.log("🔄 Carregando configurações do Supabase...")

    if (typeof window !== "undefined" && window.supabaseConfig) {
      const configCarregada = await window.supabaseConfig.carregarConfigSupabase()
      const menuCarregado = await window.supabaseConfig.carregarMenuItemsSupabase()

      // Atualizar CONFIG e menuItems
      Object.assign(CONFIG, configCarregada)
      Object.assign(menuItems, menuCarregado)

      CONFIG.produtos = convertMenuItemsToProducts()

      // Atualizar splash screen com dados da empresa
      updateSplashScreen()

      console.log("✅ Configurações carregadas do Supabase!")
      return true
    } else {
      console.log("⚠️ Supabase não disponível, usando configurações locais")
      CONFIG.produtos = convertMenuItemsToProducts()
      updateSplashScreen()
      return false
    }
  } catch (error) {
    console.error("❌ Erro ao carregar configurações:", error)
    CONFIG.produtos = convertMenuItemsToProducts()
    updateSplashScreen()
    return false
  }
}

// Função para atualizar a splash screen com dados da empresa
function updateSplashScreen() {
  const splashLogo = document.querySelector(".splash-logo")
  const splashTitle = document.querySelector(".splash-text h1")
  const splashSubtitle = document.querySelector(".splash-text p")

  if (splashLogo && CONFIG.empresa.logo) {
    splashLogo.src = CONFIG.empresa.logo
  }

  if (splashTitle && CONFIG.empresa.nome) {
    splashTitle.textContent = CONFIG.empresa.nome
  }

  if (splashSubtitle) {
    splashSubtitle.textContent = "Bem-vindo ao nosso cardápio digital"
  }
}

// Função para salvar configurações no Supabase
async function salvarConfiguracoes() {
  try {
    console.log("💾 Salvando configurações no Supabase...")

    if (typeof window !== "undefined" && window.supabaseConfig) {
      const configSalva = await window.supabaseConfig.salvarConfigSupabase(CONFIG)
      const menuSalvo = await window.supabaseConfig.salvarMenuItemsSupabase(menuItems)

      if (configSalva && menuSalvo) {
        console.log("✅ Configurações salvas no Supabase!")
        return true
      } else {
        console.error("❌ Erro ao salvar no Supabase")
        return false
      }
    } else {
      console.log("⚠️ Supabase não disponível, salvando localmente")
      localStorage.setItem("menuConfig", JSON.stringify(CONFIG))
      localStorage.setItem("menuItems", JSON.stringify(menuItems))
      localStorage.setItem("lastUpdate", new Date().toISOString())
      return true
    }
  } catch (error) {
    console.error("❌ Erro ao salvar configurações:", error)
    return false
  }
}

// Função para exportar configurações no formato .ini
function exportarConfigINI() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  let iniContent = `; Configurações do Cardápio Digital - ${CONFIG.empresa.nome}\n`
  iniContent += `; Exportado em: ${new Date().toLocaleString("pt-BR")}\n\n`

  // Empresa
  iniContent += "[EMPRESA]\n"
  iniContent += `nome="${CONFIG.empresa.nome}"\n`
  iniContent += `telefone="${CONFIG.empresa.telefone}"\n`
  iniContent += `endereco="${CONFIG.empresa.endereco}"\n`
  iniContent += `instagram="${CONFIG.empresa.instagram}"\n`
  iniContent += `facebook="${CONFIG.empresa.facebook}"\n\n`

  // Horários
  iniContent += "[HORARIOS]\n"
  iniContent += `ativo=${CONFIG.horarioFuncionamento.ativo ? "true" : "false"}\n`
  Object.keys(CONFIG.horarioFuncionamento.horarios).forEach((dia) => {
    const horario = CONFIG.horarioFuncionamento.horarios[dia]
    iniContent += `${dia}_aberto=${horario.aberto ? "true" : "false"}\n`
    iniContent += `${dia}_abertura="${horario.abertura}"\n`
    iniContent += `${dia}_fechamento="${horario.fechamento}"\n`
  })
  iniContent += "\n"

  // Pagamento
  iniContent += "[PAGAMENTO]\n"
  iniContent += `pix_ativo=${CONFIG.pagamento.pix.ativo ? "true" : "false"}\n`
  iniContent += `pix_chave="${CONFIG.pagamento.pix.chave}"\n`
  iniContent += `dinheiro_ativo=${CONFIG.pagamento.dinheiro.ativo ? "true" : "false"}\n`
  iniContent += `cartao_ativo=${CONFIG.pagamento.cartao.ativo ? "true" : "false"}\n`
  iniContent += `delivery_ativo=${CONFIG.pagamento.delivery.ativo ? "true" : "false"}\n`
  iniContent += `delivery_taxa=${CONFIG.pagamento.delivery.taxa}\n`
  iniContent += `delivery_tempo="${CONFIG.pagamento.delivery.tempoEntrega}"\n\n`

  // WhatsApp
  iniContent += "[WHATSAPP]\n"
  iniContent += `numero="${CONFIG.configuracoes.numeroWhatsapp}"\n`
  iniContent += `ativo=${CONFIG.configuracoes.whatsappPedidos ? "true" : "false"}\n\n`

  downloadFile(iniContent, `cardapio-config-${timestamp}.ini`, "text/plain")
}

// Função para exportar produtos em formato .txt
function exportarProdutosTXT() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  let txtContent = `CARDÁPIO DIGITAL - ${CONFIG.empresa.nome}\n`
  txtContent += `Exportado em: ${new Date().toLocaleString("pt-BR")}\n`
  txtContent += `${"-".repeat(60)}\n\n`

  Object.keys(menuItems).forEach((categoria) => {
    txtContent += `${categoria.toUpperCase()}:\n`
    txtContent += `${"-".repeat(20)}\n`

    menuItems[categoria].forEach((item) => {
      txtContent += `• ${item.name}\n`
      txtContent += `  Preço: R$ ${item.price.toFixed(2).replace(".", ",")}\n`
      txtContent += `  Descrição: ${item.description}\n`
      txtContent += `  Disponível: ${item.disponivel ? "SIM" : "NÃO"}\n\n`
    })
    txtContent += "\n"
  })

  downloadFile(txtContent, `cardapio-produtos-${timestamp}.txt`, "text/plain")
}

// Função para exportar backup completo
function exportarBackupCompleto() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupData = {
    config: CONFIG,
    menuItems: menuItems,
    exportedAt: new Date().toISOString(),
    version: "1.0",
  }

  const jsonContent = JSON.stringify(backupData, null, 2)
  downloadFile(jsonContent, `cardapio-backup-completo-${timestamp}.json`, "application/json")
}

// Função para fazer download de arquivo
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Função para importar configurações de arquivo .ini
function importarConfigINI(fileContent) {
  try {
    const lines = fileContent.split("\n")
    let currentSection = ""
    const importedConfig = {}

    lines.forEach((line) => {
      line = line.trim()
      if (line.startsWith(";") || line === "") return

      if (line.startsWith("[") && line.endsWith("]")) {
        currentSection = line.slice(1, -1).toLowerCase()
        return
      }

      if (line.includes("=")) {
        const [key, value] = line.split("=", 2)
        const cleanKey = key.trim()
        const cleanValue = value.trim().replace(/^"|"$/g, "")

        if (currentSection === "empresa") {
          if (!importedConfig.empresa) importedConfig.empresa = {}
          importedConfig.empresa[cleanKey] = cleanValue
        } else if (currentSection === "horarios") {
          if (!importedConfig.horarioFuncionamento) {
            importedConfig.horarioFuncionamento = { horarios: {} }
          }
          if (cleanKey === "ativo") {
            importedConfig.horarioFuncionamento.ativo = cleanValue === "true"
          } else if (cleanKey.includes("_")) {
            const [dia, prop] = cleanKey.split("_")
            if (!importedConfig.horarioFuncionamento.horarios[dia]) {
              importedConfig.horarioFuncionamento.horarios[dia] = {}
            }
            if (prop === "aberto") {
              importedConfig.horarioFuncionamento.horarios[dia][prop] = cleanValue === "true"
            } else {
              importedConfig.horarioFuncionamento.horarios[dia][prop] = cleanValue
            }
          }
        } else if (currentSection === "pagamento") {
          if (!importedConfig.pagamento) {
            importedConfig.pagamento = { pix: {}, dinheiro: {}, cartao: {}, delivery: {} }
          }
          if (cleanKey.startsWith("pix_")) {
            const prop = cleanKey.replace("pix_", "")
            if (prop === "ativo") {
              importedConfig.pagamento.pix[prop] = cleanValue === "true"
            } else {
              importedConfig.pagamento.pix[prop] = cleanValue
            }
          } else if (cleanKey.startsWith("delivery_")) {
            const prop = cleanKey.replace("delivery_", "")
            if (prop === "ativo") {
              importedConfig.pagamento.delivery[prop] = cleanValue === "true"
            } else if (prop === "taxa") {
              importedConfig.pagamento.delivery[prop] = Number.parseFloat(cleanValue)
            } else {
              importedConfig.pagamento.delivery[prop] = cleanValue
            }
          } else if (cleanKey.endsWith("_ativo")) {
            const tipo = cleanKey.replace("_ativo", "")
            importedConfig.pagamento[tipo].ativo = cleanValue === "true"
          }
        } else if (currentSection === "whatsapp") {
          if (!importedConfig.configuracoes) importedConfig.configuracoes = {}
          if (cleanKey === "numero") {
            importedConfig.configuracoes.numeroWhatsapp = cleanValue
          } else if (cleanKey === "ativo") {
            importedConfig.configuracoes.whatsappPedidos = cleanValue === "true"
          }
        }
      }
    })

    // Aplicar configurações importadas
    Object.assign(CONFIG, importedConfig)
    salvarConfiguracoes()
    return true
  } catch (error) {
    console.error("Erro ao importar arquivo .ini:", error)
    return false
  }
}

// Função para importar produtos de arquivo .txt
function importarProdutosTXT(fileContent) {
  try {
    const lines = fileContent.split("\n")
    const importedMenuItems = {}
    let currentCategory = ""

    lines.forEach((line) => {
      line = line.trim()
      if (line === "" || line.startsWith("CARDÁPIO") || line.startsWith("Exportado") || line.startsWith("-")) return

      // Detectar categoria
      if (line.endsWith(":") && !line.startsWith("•") && !line.includes("R$")) {
        currentCategory = line.replace(":", "").toLowerCase()
        if (currentCategory === "sanduíches") currentCategory = "sandwiches"
        if (!importedMenuItems[currentCategory]) {
          importedMenuItems[currentCategory] = []
        }
        return
      }

      // Detectar produto
      if (line.startsWith("•")) {
        const productName = line.replace("•", "").trim()
        if (currentCategory && productName) {
          const newProduct = {
            name: productName,
            price: 0,
            description: "",
            disponivel: true,
          }
          importedMenuItems[currentCategory].push(newProduct)
        }
      }

      // Detectar preço
      if (line.includes("Preço: R$") && currentCategory && importedMenuItems[currentCategory].length > 0) {
        const priceMatch = line.match(/R\$ ([\d,]+)/)
        if (priceMatch) {
          const price = Number.parseFloat(priceMatch[1].replace(",", "."))
          const lastProduct = importedMenuItems[currentCategory][importedMenuItems[currentCategory].length - 1]
          lastProduct.price = price
        }
      }

      // Detectar descrição
      if (line.includes("Descrição:") && currentCategory && importedMenuItems[currentCategory].length > 0) {
        const description = line.replace("Descrição:", "").trim()
        const lastProduct = importedMenuItems[currentCategory][importedMenuItems[currentCategory].length - 1]
        lastProduct.description = description
      }

      // Detectar disponibilidade
      if (line.includes("Disponível:") && currentCategory && importedMenuItems[currentCategory].length > 0) {
        const disponivel = line.includes("SIM")
        const lastProduct = importedMenuItems[currentCategory][importedMenuItems[currentCategory].length - 1]
        lastProduct.disponivel = disponivel
      }
    })

    // Aplicar produtos importados
    Object.assign(menuItems, importedMenuItems)
    CONFIG.produtos = convertMenuItemsToProducts()
    salvarConfiguracoes()
    return true
  } catch (error) {
    console.error("Erro ao importar arquivo .txt:", error)
    return false
  }
}

// Função para importar backup completo JSON
function importarBackupJSON(fileContent) {
  try {
    const backupData = JSON.parse(fileContent)

    if (backupData.config) {
      Object.assign(CONFIG, backupData.config)
    }

    if (backupData.menuItems) {
      Object.assign(menuItems, backupData.menuItems)
    }

    CONFIG.produtos = convertMenuItemsToProducts()
    salvarConfiguracoes()
    return true
  } catch (error) {
    console.error("Erro ao importar backup JSON:", error)
    return false
  }
}

// Inicializar configurações
CONFIG.produtos = convertMenuItemsToProducts()

// Exportar configuração
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CONFIG,
    menuItems,
    ADMIN_CONFIG,
    salvarConfiguracoes,
    carregarConfiguracoes,
    exportarConfigINI,
    exportarProdutosTXT,
    exportarBackupCompleto,
    importarConfigINI,
    importarProdutosTXT,
    importarBackupJSON,
  }
}
