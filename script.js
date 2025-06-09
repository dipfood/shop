// ===== VARIÁVEIS GLOBAIS =====
const navMenu = document.getElementById("nav-menu")
const navToggle = document.getElementById("nav-toggle")
const navLinks = document.querySelectorAll(".nav__link")
const header = document.getElementById("header")
const cityModal = document.getElementById("cityModal")
const contactForm = document.querySelector(".contact__form")

// ===== MENU MOBILE =====
function toggleMenu() {
  navMenu.classList.toggle("show-menu")
  navToggle.classList.toggle("active")
}

// Event listener para o botão do menu
if (navToggle) {
  navToggle.addEventListener("click", toggleMenu)
}

// Fechar menu ao clicar nos links
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("show-menu")
    navToggle.classList.remove("active")
  })
})

// ===== HEADER SCROLL =====
function scrollHeader() {
  if (window.scrollY >= 50) {
    header.classList.add("scroll-header")
  } else {
    header.classList.remove("scroll-header")
  }
}

window.addEventListener("scroll", scrollHeader)

// ===== MODAL DE CIDADES =====
function openModal() {
  cityModal.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeModal() {
  cityModal.classList.remove("active")
  document.body.style.overflow = "auto"
}

function selectCity(phone, cityName) {
  selectCityForPlan(phone, cityName)
}

// Fechar modal ao clicar fora
cityModal.addEventListener("click", (e) => {
  if (e.target === cityModal) {
    closeModal()
  }
})

// ===== FORMULÁRIO DE CONTATO =====
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Simular envio do formulário
    const submitBtn = contactForm.querySelector(".btn--primary")
    const originalText = submitBtn.textContent

    submitBtn.textContent = "Enviando..."
    submitBtn.disabled = true

    setTimeout(() => {
      alert("Obrigado! Recebemos sua mensagem e entraremos em contato em breve.")
      contactForm.reset()
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }, 2000)
  })
}

// ===== BOTÕES DOS PLANOS =====
const planButtons = document.querySelectorAll(".plan__button")
let selectedPlan = null

planButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const planCard = e.target.closest(".plan__card")
    const planName = planCard.querySelector(".plan__name").textContent
    const planPrice = planCard.querySelector(".plan__amount").textContent

    // Armazenar informações do plano selecionado
    selectedPlan = {
      name: planName,
      price: planPrice,
    }

    // Abrir modal de seleção de cidade
    openModal()
  })
})

// Modificar a função selectCity para incluir informações do plano
function selectCityForPlan(phone, cityName) {
  let message

  if (selectedPlan) {
    message = `Olá! Sou de ${cityName} e tenho interesse no plano ${selectedPlan.name} por R$${selectedPlan.price}/mês. Gostaria de mais informações sobre a contratação.`
  } else {
    message = `Olá! Sou de ${cityName} e gostaria de saber mais sobre os serviços da DipFood.`
  }

  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`

  window.open(whatsappUrl, "_blank")
  closeModal()

  // Limpar plano selecionado
  selectedPlan = null
}

// ===== SCROLL SUAVE =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))

    if (target) {
      const headerHeight = header.offsetHeight
      const targetPosition = target.offsetTop - headerHeight

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
  })
})

// ===== ANIMAÇÕES DE SCROLL =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1"
      entry.target.style.transform = "translateY(0)"
    }
  })
}, observerOptions)

// Elementos para animar
const animateElements = document.querySelectorAll(".benefit__card, .plan__card, .feature, .contact__form")

animateElements.forEach((el) => {
  el.style.opacity = "0"
  el.style.transform = "translateY(30px)"
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
  observer.observe(el)
})

// ===== ANO ATUAL NO FOOTER =====
document.addEventListener("DOMContentLoaded", () => {
  const currentYearElement = document.getElementById("currentYear")
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear()
  }
})

// ===== PREVENÇÃO DE SCROLL DURANTE MODAL =====
function preventScroll(e) {
  e.preventDefault()
}

// Adicionar/remover prevenção de scroll quando modal abre/fecha
const modalObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      if (cityModal.classList.contains("active")) {
        document.addEventListener("wheel", preventScroll, { passive: false })
        document.addEventListener("touchmove", preventScroll, { passive: false })
      } else {
        document.removeEventListener("wheel", preventScroll)
        document.removeEventListener("touchmove", preventScroll)
      }
    }
  })
})

modalObserver.observe(cityModal, { attributes: true })

// ===== LOADING STATES =====
function addLoadingState(button) {
  const originalText = button.textContent
  button.textContent = "Carregando..."
  button.disabled = true

  return () => {
    button.textContent = originalText
    button.disabled = false
  }
}

// ===== VALIDAÇÃO DE FORMULÁRIO =====
function validateForm(form) {
  const inputs = form.querySelectorAll("input[required], select[required], textarea[required]")
  let isValid = true

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.style.borderColor = "#ef4444"
      isValid = false
    } else {
      input.style.borderColor = "#d1d5db"
    }
  })

  return isValid
}

// ===== EASTER EGG =====
let clickCount = 0
const logo = document.querySelector(".nav__logo")

if (logo) {
  logo.addEventListener("click", () => {
    clickCount++
    if (clickCount === 5) {
      alert("🎉 Parabéns! Você descobriu nosso easter egg! Entre em contato e ganhe 10% de desconto!")
      clickCount = 0
    }
  })
}

// ===== PERFORMANCE =====
// Lazy loading para imagens
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.remove("lazy")
        imageObserver.unobserve(img)
      }
    })
  })

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img)
  })
}

// ===== CONSOLE MESSAGE =====
console.log(`
🍕 DipFood - Cardápio Digital
🚀 Site desenvolvido com HTML, CSS e JavaScript puro
📱 Totalmente responsivo e otimizado
💡 Interessado em nossos serviços? Entre em contato!
`)
