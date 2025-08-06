// Sistema de resolução de tenant por subdomínio
class TenantResolver {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.currentTenant = null;
        this.baseDomain = this.getBaseDomain();
    }

    // Obter domínio base (ex: dipfood.site)
    getBaseDomain() {
        const hostname = window.location.hostname;
        
        // Para desenvolvimento local, o hostname é o próprio "domínio base"
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return hostname;
        }
        
        // Para produção, extrair o domínio base (últimas duas partes)
        const parts = hostname.split('.');
        if (parts.length >= 2) { // Ex: dipfood.site ou empresa.dipfood.site
            return parts.slice(-2).join('.');
        }
        
        return hostname; // Fallback, caso o hostname seja algo inesperado
    }

    // Extrair subdomínio da URL atual
    getSubdomain() {
        const hostname = window.location.hostname;
        
        // Para desenvolvimento local, usar 'demo' como padrão para um tenant
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'demo'; // Ou qualquer subdomínio padrão para testes locais
        }
        
        // Para produção, extrair o primeiro segmento como subdomínio
        const parts = hostname.split('.');
        // Se o hostname for 'empresa.dipfood.site', parts[0] é 'empresa'
        // Se o hostname for 'dipfood.site', parts.length é 2, e não há subdomínio de tenant
        if (parts.length > 2) {
            return parts[0];
        }
        
        return null; // Não há subdomínio de tenant (ex: acessou dipfood.site diretamente)
    }

    // Resolver tenant atual
    async resolveTenant() {
        const subdomain = this.getSubdomain();
        
        if (!subdomain) {
            throw new Error('Subdomínio de empresa não encontrado. Acesse via subdomínio (ex: empresa.dipfood.site).');
        }

        try {
            const { data, error } = await this.supabase
                .rpc('get_company_by_subdomain', { subdomain_param: subdomain });

            if (error) throw error;

            if (!data || data.length === 0) {
                throw new Error('Empresa não encontrada ou inativa para o subdomínio: ' + subdomain);
            }

            this.currentTenant = data[0];
            return this.currentTenant;
        } catch (error) {
            console.error('Erro ao resolver tenant:', error);
            throw error;
        }
    }

    // Obter tenant atual
    getCurrentTenant() {
        return this.currentTenant;
    }

    // Verificar se tenant está ativo
    isTenantActive() {
        return this.currentTenant && this.currentTenant.status === 'active';
    }

    // Obter configurações do tenant
    getTenantSettings() {
        return this.currentTenant?.settings || {};
    }

    // Aplicar configurações visuais do tenant
    applyTenantBranding() {
        if (!this.currentTenant) return;

        const settings = this.getTenantSettings();
        
        // Aplicar cores personalizadas
        if (settings.headerColorStart && settings.headerColorEnd) {
            const header = document.querySelector('.header');
            if (header) {
                header.style.background = `linear-gradient(135deg, ${settings.headerColorStart} 0%, ${settings.headerColorEnd} 100%)`;
            }
        }

        if (settings.backgroundColor) {
            document.body.style.backgroundColor = settings.backgroundColor;
        }

        // Aplicar logo
        if (this.currentTenant.logo_url) {
            const logoElements = document.querySelectorAll('.splash-logo, .company-logo, .loading-logo');
            logoElements.forEach(logo => {
                if (logo.tagName === 'IMG') {
                    logo.src = this.currentTenant.logo_url;
                } else {
                    logo.style.backgroundImage = `url(${this.currentTenant.logo_url})`;
                    logo.style.backgroundSize = 'contain';
                    logo.style.backgroundRepeat = 'no-repeat';
                    logo.style.backgroundPosition = 'center';
                }
            });
        }

        // Atualizar título da página
        document.title = this.currentTenant.name + ' - Cardápio Digital';
        
        // Atualizar meta tags
        this.updateMetaTags();
    }

    // Atualizar meta tags para SEO
    updateMetaTags() {
        if (!this.currentTenant) return;

        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = `Cardápio digital da ${this.currentTenant.name}. Faça seu pedido online de forma rápida e prática.`;

        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = 'keywords';
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.content = `${this.currentTenant.name}, cardápio digital, delivery, pedido online, restaurante`;

        this.updateOpenGraphTags();
    }

    // Atualizar Open Graph tags para compartilhamento
    updateOpenGraphTags() {
        const ogTags = [
            { property: 'og:title', content: this.currentTenant.name + ' - Cardápio Digital' },
            { property: 'og:description', content: `Cardápio digital da ${this.currentTenant.name}. Faça seu pedido online!` },
            { property: 'og:type', content: 'website' },
            { property: 'og:url', content: window.location.href }
        ];

        if (this.currentTenant.logo_url) {
            ogTags.push({ property: 'og:image', content: this.currentTenant.logo_url });
        }

        ogTags.forEach(tag => {
            let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('property', tag.property);
                document.head.appendChild(metaTag);
            }
            metaTag.content = tag.content;
        });
    }

    // Redirecionar para página de erro se tenant inválido
    redirectToError(message = 'Empresa não encontrada') {
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 2rem;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 3rem;
                    max-width: 500px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                ">
                    <h1 style="font-size: 4rem; margin-bottom: 1rem;">🏢</h1>
                    <h2 style="font-size: 2rem; margin-bottom: 1rem;">Ops!</h2>
                    <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">
                        ${message}
                    </p>
                    <p style="font-size: 1rem; opacity: 0.7; margin-bottom: 1rem;">
                        Verifique se o endereço está correto ou entre em contato com o suporte.
                    </p>
                    <p style="font-size: 0.9rem; opacity: 0.6;">
                        URL atual: <strong>${window.location.hostname}</strong>
                    </p>
                </div>
            </div>
        `;
    }

    // Gerar URL para empresa com base no subdomínio
    static generateCompanyUrl(subdomain, baseDomain = null) {
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : '';
        
        if (!baseDomain) {
            // Tenta inferir o baseDomain do ambiente atual se não for fornecido
            const hostname = window.location.hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                baseDomain = hostname;
            } else {
                const parts = hostname.split('.');
                baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
            }
        }
        
        // Para desenvolvimento local, o subdomínio pode ser o próprio hostname
        if (baseDomain === 'localhost' || baseDomain === '127.0.0.1') {
            return `${protocol}//${subdomain}${port}`;
        }
        
        // Para produção, usar subdomínio.dominio.com
        return `${protocol}//${subdomain}.${baseDomain}${port}`;
    }
}

// Função para inicializar o sistema multi-tenant
async function initializeTenantSystem(supabaseClient) {
    const resolver = new TenantResolver(supabaseClient);
    
    try {
        await resolver.resolveTenant();
        
        if (!resolver.isTenantActive()) {
            resolver.redirectToError('Esta empresa está temporariamente indisponível');
            return null;
        }
        
        resolver.applyTenantBranding();
        
        console.log('✅ Tenant resolvido:', resolver.getCurrentTenant());
        console.log('🌐 URL atual:', window.location.hostname);
        console.log('🏢 Subdomínio detectado:', resolver.getSubdomain());
        
        return resolver;
        
    } catch (error) {
        console.error('❌ Erro ao inicializar sistema multi-tenant:', error);
        resolver.redirectToError(error.message); // Passa a mensagem de erro para a página de erro
        return null;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.TenantResolver = TenantResolver;
    window.initializeTenantSystem = initializeTenantSystem;
}
