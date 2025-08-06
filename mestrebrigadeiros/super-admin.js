// Configuração do Supabase
const SUPABASE_URL = 'https://gckowyxkdyshvqyjtwjb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja293eXhrZHlzaHZxeWp0d2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTMyMDgsImV4cCI6MjA2NzgyOTIwOH0.3CiR4nFvwtd6vUnHe368nFanE79jPFmMUhIT1vJAVog';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variáveis globais
let currentSection = 'dashboard';
let companies = [];
let systemSettings = {};

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Iniciando Super Admin...');
    
    try {
        await initializeSuperAdmin();
        setupEventListeners();
        console.log('✅ Super Admin carregado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        alert('Erro ao carregar painel. Verifique as credenciais do Supabase.');
    }
});

// Configurar event listeners
function setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchSection(this.dataset.section);
        });
    });

    // Botões principais
    const addCompanyBtn = document.getElementById('add-company-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (addCompanyBtn) addCompanyBtn.addEventListener('click', () => openCompanyModal());
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Formulários
    const companyForm = document.getElementById('company-form');
    const systemSettingsForm = document.getElementById('system-settings-form');
    
    if (companyForm) companyForm.addEventListener('submit', saveCompany);
    if (systemSettingsForm) systemSettingsForm.addEventListener('submit', saveSystemSettings);

    // Modais
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Filtros
    const companySearch = document.getElementById('company-search');
    const statusFilter = document.getElementById('status-filter');
    const planFilter = document.getElementById('plan-filter');
    
    if (companySearch) companySearch.addEventListener('input', filterCompanies);
    if (statusFilter) statusFilter.addEventListener('change', filterCompanies);
    if (planFilter) planFilter.addEventListener('change', filterCompanies);

    // Validação de subdomínio em tempo real
    const subdomainInput = document.getElementById('company-subdomain');
    if (subdomainInput) {
        subdomainInput.addEventListener('input', validateSubdomain);
        subdomainInput.addEventListener('blur', checkSubdomainAvailability);
    }

    console.log('✅ Event listeners configurados!');
}

// Inicializar Super Admin
async function initializeSuperAdmin() {
    console.log('📊 Carregando dados...');
    
    await loadSystemSettings();
    await loadCompanies();
    
    loadDashboard();
    
    console.log('✅ Dados carregados!');
}

// Alternar seção
function switchSection(section) {
    console.log(`🔄 Mudando para seção: ${section}`);
    
    // Remover classe active de todas as seções e botões
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Adicionar classe active na seção e botão atual
    const sectionElement = document.getElementById(section);
    const buttonElement = document.querySelector(`[data-section="${section}"]`);
    
    if (sectionElement) sectionElement.classList.add('active');
    if (buttonElement) buttonElement.classList.add('active');
    
    currentSection = section;

    // Carregar dados específicos da seção
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'companies':
            displayCompanies();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'settings':
            displaySystemSettings();
            break;
    }
}

// Carregar configurações do sistema
async function loadSystemSettings() {
    try {
        console.log('⚙️ Carregando configurações do sistema...');
        
        // Configurações padrão
        systemSettings = {
            baseDomain: 'dipfood.site', // Domínio principal para os subdomínios
            allowSelfRegistration: false,
            defaultPlan: 'basic'
        };
        
        // Tenta carregar do localStorage se existir
        const storedSettings = localStorage.getItem('systemSettings');
        if (storedSettings) {
            Object.assign(systemSettings, JSON.parse(storedSettings));
        }

        console.log('✅ Configurações do sistema carregadas', systemSettings);
    } catch (error) {
        console.error('❌ Erro ao carregar configurações do sistema:', error);
    }
}

// Carregar empresas
async function loadCompanies() {
    try {
        console.log('🏢 Carregando empresas...');
        
        const { data, error } = await supabase
            .from('companies')
            .select(`
                *,
                company_admins!inner(count)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        companies = data || [];
        
        console.log(`✅ ${companies.length} empresas carregadas`);
    } catch (error) {
        console.error('❌ Erro ao carregar empresas:', error);
        companies = [];
    }
}

// Carregar dashboard
async function loadDashboard() {
    try {
        console.log('📊 Carregando dashboard...');
        
        // Estatísticas básicas
        const totalCompanies = companies.length;
        const activeCompanies = companies.filter(c => c.status === 'active').length;
        
        // Pedidos de hoje (de todas as empresas)
        const today = new Date().toISOString().split('T')[0];
        const { data: todayOrders, error: ordersError } = await supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', today + 'T00:00:00')
            .lte('created_at', today + 'T23:59:59');

        if (ordersError) throw ordersError;

        const ordersToday = todayOrders?.length || 0;
        const totalRevenue = todayOrders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;

        // Atualizar dashboard
        updateDashboardStats({
            totalCompanies,
            activeCompanies,
            ordersToday,
            totalRevenue
        });

        // Carregar atividade recente
        await loadRecentActivity();

        console.log('✅ Dashboard atualizado!');
    } catch (error) {
        console.error('❌ Erro ao carregar dashboard:', error);
    }
}

// Atualizar estatísticas do dashboard
function updateDashboardStats(stats) {
    const elements = {
        'total-companies': stats.totalCompanies,
        'active-companies': stats.activeCompanies,
        'orders-today': stats.ordersToday,
        'total-revenue': `R$ ${stats.totalRevenue.toFixed(2).replace('.', ',')}`
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

// Carregar atividade recente
async function loadRecentActivity() {
    try {
        const activities = [];
        
        // Empresas criadas recentemente
        const recentCompanies = companies
            .filter(c => {
                const createdAt = new Date(c.created_at);
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return createdAt > dayAgo;
            })
            .slice(0, 3);

        recentCompanies.forEach(company => {
            activities.push({
                icon: '🏢',
                iconClass: 'success',
                text: `Nova empresa "${company.name}" criada`,
                time: formatTimeAgo(company.created_at)
            });
        });

        // Pedidos recentes
        const { data: recentOrders } = await supabase
            .from('orders')
            .select('id, customer_name, total_amount, created_at, companies(name)')
            .order('created_at', { ascending: false })
            .limit(5);

        if (recentOrders) {
            recentOrders.forEach(order => {
                activities.push({
                    icon: '📋',
                    iconClass: 'info',
                    text: `Novo pedido de ${order.customer_name} - ${order.companies?.name}`,
                    time: formatTimeAgo(order.created_at)
                });
            });
        }

        displayRecentActivity(activities.slice(0, 8));
    } catch (error) {
        console.error('❌ Erro ao carregar atividade recente:', error);
    }
}

// Exibir atividade recente
function displayRecentActivity(activities) {
    const container = document.getElementById('recent-activity-list');
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma atividade recente.</p>';
        return;
    }

    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.iconClass}">${activity.icon}</div>
            <div class="activity-content">
                <p>${activity.text}</p>
                <small>${activity.time}</small>
            </div>
        </div>
    `).join('');
}

// Exibir empresas
function displayCompanies() {
    const container = document.getElementById('companies-list');
    if (!container) return;
    
    if (companies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏢</div>
                <h3>Nenhuma empresa cadastrada</h3>
                <p>Clique em "Nova Empresa" para começar</p>
            </div>
        `;
        return;
    }

    container.innerHTML = companies.map(company => {
        const companyUrl = TenantResolver.generateCompanyUrl(company.subdomain, systemSettings.baseDomain);
        return `
            <div class="company-card" data-company-id="${company.id}">
                <div class="company-header">
                    <div class="company-logo">
                        ${company.logo_url ? 
                            `<img src="${company.logo_url}" alt="${company.name}">` : 
                            '🏢'
                        }
                    </div>
                    <div class="company-info">
                        <h3>${company.name}</h3>
                        <div class="company-subdomain">
                            <a href="${companyUrl}" target="_blank" style="color: var(--primary-color); text-decoration: none;">
                                ${company.subdomain}.${systemSettings.baseDomain}
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="company-details">
                    <div class="company-detail">
                        <strong>Email:</strong>
                        <span>${company.email}</span>
                    </div>
                    <div class="company-detail">
                        <strong>Telefone:</strong>
                        <span>${company.phone || 'Não informado'}</span>
                    </div>
                    <div class="company-detail">
                        <strong>URL:</strong>
                        <span style="font-family: monospace; font-size: 0.8em;">${companyUrl}</span>
                    </div>
                    <div class="company-detail">
                        <strong>Criado em:</strong>
                        <span>${formatDate(company.created_at)}</span>
                    </div>
                </div>

                <div class="company-badges">
                    <span class="badge ${company.status}">${getStatusText(company.status)}</span>
                    <span class="badge ${company.plan}">${getPlanText(company.plan)}</span>
                </div>

                <div class="company-actions">
                    <button class="btn-small btn-view" onclick="viewCompany('${company.id}')">
                        Ver
                    </button>
                    <button class="btn-small btn-edit" onclick="editCompany('${company.id}')">
                        Editar
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteCompany('${company.id}')">
                        Excluir
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Filtrar empresas
function filterCompanies() {
    const searchTerm = document.getElementById('company-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const planFilter = document.getElementById('plan-filter')?.value || '';

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchTerm) ||
                            company.subdomain.toLowerCase().includes(searchTerm) ||
                            company.email.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || company.status === statusFilter;
        const matchesPlan = !planFilter || company.plan === planFilter;

        return matchesSearch && matchesStatus && matchesPlan;
    });

    // Temporariamente substituir companies para exibição
    const originalCompanies = companies;
    companies = filteredCompanies;
    displayCompanies();
    companies = originalCompanies;
}

// Abrir modal de empresa
function openCompanyModal(companyId = null) {
    const modal = document.getElementById('company-modal');
    const title = document.getElementById('company-modal-title');
    const form = document.getElementById('company-form');
    const subdomainSuffix = document.querySelector('.subdomain-suffix');
    
    if (!modal || !title || !form) return;
    
    // Atualizar sufixo do subdomínio
    if (subdomainSuffix) {
        subdomainSuffix.textContent = `.${systemSettings.baseDomain}`;
        subdomainSuffix.style.display = 'inline'; // Garante que o sufixo seja visível
    }
    
    // Limpar formulário
    form.reset();
    document.getElementById('company-id').value = '';
    
    if (companyId) {
        // Editar empresa
        const company = companies.find(c => c.id === companyId);
        if (company) {
            title.textContent = 'Editar Empresa';
            document.getElementById('company-id').value = company.id;
            document.getElementById('company-name').value = company.name;
            document.getElementById('company-subdomain').value = company.subdomain;
            document.getElementById('company-email').value = company.email;
            document.getElementById('company-phone').value = company.phone || '';
            document.getElementById('company-address').value = company.address || '';
            document.getElementById('company-status').value = company.status;
            document.getElementById('company-plan').value = company.plan;
            document.getElementById('company-logo').value = company.logo_url || '';
            
            // Ocultar campos de admin para edição
            document.querySelector('.admin-section-form').style.display = 'none';
        }
    } else {
        // Nova empresa
        title.textContent = 'Nova Empresa';
        document.getElementById('company-status').value = 'active';
        document.getElementById('company-plan').value = systemSettings.defaultPlan;
        
        // Mostrar campos de admin para nova empresa
        document.querySelector('.admin-section-form').style.display = 'block';
    }

    modal.style.display = 'block';
}

// Validar subdomínio
function validateSubdomain() {
    const input = document.getElementById('company-subdomain');
    const value = input.value.toLowerCase();
    
    // Aplicar transformações
    input.value = value.replace(/[^a-z0-9-]/g, '');
    
    // Validar formato
    const isValid = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(input.value) && input.value.length >= 3;
    
    if (input.value && !isValid) {
        input.setCustomValidity('Subdomínio deve ter pelo menos 3 caracteres, começar e terminar com letra ou número, e conter apenas letras minúsculas, números e hífens.');
    } else {
        input.setCustomValidity('');
    }
}

// Verificar disponibilidade do subdomínio
async function checkSubdomainAvailability() {
    const input = document.getElementById('company-subdomain');
    const companyId = document.getElementById('company-id').value;
    
    if (!input.value || input.value.length < 3) return;
    
    try {
        const { data, error } = await supabase
            .rpc('is_subdomain_available', { subdomain_check: input.value });
        
        if (error) throw error;
        
        // Se estamos editando, permitir o subdomínio atual
        const isEditing = companyId && companies.find(c => c.id === companyId && c.subdomain === input.value);
        
        if (!data && !isEditing) {
            input.setCustomValidity('Este subdomínio já está em uso.');
            showNotification('Subdomínio não disponível', 'error');
        } else {
            input.setCustomValidity('');
            if (!isEditing) {
                showNotification('Subdomínio disponível', 'success');
            }
        }
    } catch (error) {
        console.error('Erro ao verificar subdomínio:', error);
    }
}

// Salvar empresa
async function saveCompany(e) {
    e.preventDefault();
    
    const companyId = document.getElementById('company-id')?.value;
    const isEditing = !!companyId;
    
    const companyData = {
        name: document.getElementById('company-name')?.value,
        subdomain: document.getElementById('company-subdomain')?.value,
        email: document.getElementById('company-email')?.value,
        phone: document.getElementById('company-phone')?.value || null,
        address: document.getElementById('company-address')?.value || null,
        status: document.getElementById('company-status')?.value,
        plan: document.getElementById('company-plan')?.value,
        logo_url: document.getElementById('company-logo')?.value || null
    };

    try {
        console.log('💾 Salvando empresa...', companyData);
        
        let result;
        if (isEditing) {
            // Atualizar empresa existente
            result = await supabase
                .from('companies')
                .update(companyData)
                .eq('id', companyId)
                .select();
        } else {
            // Criar nova empresa
            result = await supabase
                .from('companies')
                .insert([companyData])
                .select();
            
            if (result.data && result.data[0]) {
                const newCompanyId = result.data[0].id;
                
                // Criar admin da empresa
                const adminData = {
                    company_id: newCompanyId,
                    name: document.getElementById('admin-name')?.value,
                    email: document.getElementById('admin-email')?.value,
                    password_hash: await hashPassword(document.getElementById('admin-password')?.value),
                    role: 'admin'
                };
                
                const adminResult = await supabase
                    .from('company_admins')
                    .insert([adminData]);
                
                if (adminResult.error) throw adminResult.error;
                
                // Criar dados padrão da empresa
                const { error: defaultDataError } = await supabase
                    .rpc('create_default_company_data', { company_uuid: newCompanyId });
                
                if (defaultDataError) throw defaultDataError;
            }
        }

        if (result.error) throw result.error;

        document.getElementById('company-modal').style.display = 'none';
        await loadCompanies();
        displayCompanies();
        
        const companyUrl = TenantResolver.generateCompanyUrl(companyData.subdomain, systemSettings.baseDomain);
        showNotification(
            isEditing ? 
                'Empresa atualizada com sucesso!' : 
                `Empresa criada com sucesso! Acesse: <a href="${companyUrl}" target="_blank" style="color: white; text-decoration: underline;">${companyUrl}</a>`,
            'success'
        );
        
        console.log('✅ Empresa salva com sucesso!');
        console.log('🌐 URL da empresa:', companyUrl);
    } catch (error) {
        console.error('❌ Erro ao salvar empresa:', error);
        showNotification('Erro ao salvar empresa: ' + error.message, 'error');
    }
}

// Hash da senha (simulação - em produção usar bcrypt no backend)
async function hashPassword(password) {
    // Em produção, isso deve ser feito no backend
    // Por enquanto, retornamos um hash simulado
    return '$2a$10$' + btoa(password + 'salt').replace(/[^a-zA-Z0-9]/g, '').substring(0, 53);
}

// Visualizar empresa
function viewCompany(companyId) {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;
    
    const url = TenantResolver.generateCompanyUrl(company.subdomain, systemSettings.baseDomain);
    window.open(url, '_blank');
}

// Editar empresa
function editCompany(companyId) {
    openCompanyModal(companyId);
}

// Excluir empresa
function deleteCompany(companyId) {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;
    
    showConfirmModal(
        `Tem certeza que deseja excluir a empresa "${company.name}"?`,
        'Esta ação não pode ser desfeita e todos os dados da empresa serão perdidos.',
        async () => {
            try {
                const { error } = await supabase
                    .from('companies')
                    .delete()
                    .eq('id', companyId);
                
                if (error) throw error;
                
                await loadCompanies();
                displayCompanies();
                showNotification('Empresa excluída com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao excluir empresa:', error);
                showNotification('Erro ao excluir empresa: ' + error.message, 'error');
            }
        }
    );
}

// Carregar analytics
function loadAnalytics() {
    console.log('📈 Carregando analytics...');
    // Implementar gráficos e métricas avançadas
}

// Exibir configurações do sistema
function displaySystemSettings() {
    document.getElementById('base-domain').value = systemSettings.baseDomain;
    // Remove o campo basePath, pois não é mais usado
    // document.getElementById('base-path').value = systemSettings.basePath; 
    document.getElementById('allow-self-registration').checked = systemSettings.allowSelfRegistration;
    document.getElementById('default-plan').value = systemSettings.defaultPlan;
}

// Salvar configurações do sistema
async function saveSystemSettings(e) {
    e.preventDefault();
    
    const newSettings = {
        baseDomain: document.getElementById('base-domain')?.value,
        // Remove o campo basePath
        allowSelfRegistration: document.getElementById('allow-self-registration')?.checked,
        defaultPlan: document.getElementById('default-plan')?.value
    };
    
    try {
        localStorage.setItem('systemSettings', JSON.stringify(newSettings));
        systemSettings = newSettings;
        
        showNotification('Configurações salvas com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showNotification('Erro ao salvar configurações', 'error');
    }
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('superAdminSession');
        window.location.href = 'super-admin-login.html';
    }
}

// Fechar modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Mostrar modal de confirmação
function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    const messageEl = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirm-action-btn');
    
    messageEl.innerHTML = `<strong>${title}</strong><br><br>${message}`;
    
    confirmBtn.onclick = () => {
        onConfirm();
        closeModal('confirm-modal');
    };
    
    modal.style.display = 'block';
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease',
        maxWidth: '400px',
        wordWrap: 'break-word'
    });
    
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    const timeout = type === 'success' && message.includes('Acesse:') ? 8000 : 5000;
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, timeout);
}

// Funções auxiliares
function getStatusText(status) {
    const statusMap = {
        'active': 'Ativo',
        'inactive': 'Inativo',
        'suspended': 'Suspenso'
    };
    return statusMap[status] || status;
}

function getPlanText(plan) {
    const planMap = {
        'basic': 'Básico',
        'premium': 'Premium',
        'enterprise': 'Enterprise'
    };
    return planMap[plan] || plan;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return formatDate(dateString);
}

// Auto-refresh dos dados
setInterval(async () => {
    if (currentSection === 'dashboard') {
        await loadCompanies();
        loadDashboard();
    }
}, 60000); // Atualiza a cada minuto

console.log('🎯 Super Admin script carregado!');
