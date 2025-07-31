// --- Definições de Constantes e Variáveis de Estado ---
const API_BASE_URL = 'http://localhost:3000'; // ALERTA: Ajuste esta URL para a URL real do seu backend!

// Referências aos elementos DOM do Dashboard
const DOM = {
    totalFuncionarios: document.getElementById('totalFuncionarios'),
    presentesHoje: document.getElementById('presentesHoje'),
    ausentesHoje: document.getElementById('ausentesHoje'),
    atrasadosHoje: document.getElementById('atrasadosHoje'),
    weeklyHoursChartCanvas: document.getElementById('weeklyHoursChart'),
    presenceStatusChartCanvas: document.getElementById('presenceStatusChart'),
};

// Variáveis para as instâncias dos gráficos Chart.js
let weeklyHoursChartInstance = null;
let presenceStatusChartInstance = null;

// --- Funções Auxiliares ---

// Função para exibir mensagens de erro/informação na UI (se houver um elemento dedicado, caso contrário, usa alert)
function displayDashboardMessage(message, isError = false) {
    // Você pode criar uma div específica no seu HTML para mensagens do dashboard, por exemplo:
    // <div id="dashboard-message" style="color: red; text-align: center; margin-top: 20px;"></div>
    const dashboardMessageDiv = document.getElementById('dashboard-message'); 
    if (dashboardMessageDiv) {
        dashboardMessageDiv.textContent = message;
        dashboardMessageDiv.style.color = isError ? 'red' : 'green';
        dashboardMessageDiv.style.display = 'block';
    } else {
        console.warn('Elemento #dashboard-message não encontrado. Usando alert para mensagens do dashboard.');
        alert(message);
    }
}

// Função para fazer logout e redirecionar
function logoutAndRedirect() {
    localStorage.removeItem('accessToken');
    // Redireciona para a tela de login. Ajuste o caminho se necessário.
    window.location.href = './login.html'; // Assumindo que sua tela de login está em login.html
}

// --- Funções para Obter Dados da API ---

async function fetchDashboardMetrics() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.warn('Token de acesso não encontrado. Redirecionando para login.');
        displayDashboardMessage('Sessão expirada ou não autenticada. Redirecionando para o login.', true);
        setTimeout(logoutAndRedirect, 2000); // Dá um tempo para o usuário ler a mensagem
        return null;
    }

    try {
        console.log('--- Buscando Métricas do Dashboard ---');
        const response = await fetch(`${API_BASE_URL}/dashboard/metrics`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Métricas do Dashboard:', data);
            DOM.totalFuncionarios.textContent = data.totalFuncionarios || 0;
            DOM.presentesHoje.textContent = data.presentesHoje || 0;
            DOM.ausentesHoje.textContent = data.ausentesHoje || 0;
            DOM.atrasadosHoje.textContent = data.atrasadosHoje || 0;
            return data;
        } else if (response.status === 401 || response.status === 403) {
            const errorData = await response.json();
            console.error('Erro de autenticação/autorização ao buscar métricas:', errorData.message);
            displayDashboardMessage('Não autorizado a acessar o dashboard. Redirecionando para o login.', true);
            setTimeout(logoutAndRedirect, 2000);
            return null;
        } else {
            const errorData = await response.json();
            console.error('Erro ao buscar métricas do dashboard:', response.status, errorData.message);
            displayDashboardMessage(`Erro ao carregar métricas: ${errorData.message || 'Erro desconhecido'}`, true);
            return null;
        }
    } catch (error) {
        console.error('Erro de rede ao buscar métricas do dashboard:', error);
        displayDashboardMessage(`Erro de rede: ${error.message}. Verifique sua conexão com o backend.`, true);
        return null;
    }
}

async function fetchWeeklyHoursData() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.warn('Token de acesso não encontrado para dados de horas semanais. Redirecionando para login.');
        return null;
    }

    try {
        console.log('--- Buscando Dados de Horas Semanais ---');
        // Suponha que o backend retorne { labels: ['Seg', 'Ter', ...], data: [8, 7, ...] }
        const response = await fetch(`${API_BASE_URL}/dashboard/weekly-hours`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Dados de Horas Semanais:', data);
            return data;
        } else if (response.status === 401 || response.status === 403) {
            console.error('Erro de autenticação/autorização ao buscar horas semanais.');
            displayDashboardMessage('Não autorizado a acessar dados de horas semanais.', true);
            return null;
        } else {
            const errorData = await response.json();
            console.error('Erro ao buscar dados de horas semanais:', response.status, errorData.message);
            displayDashboardMessage(`Erro ao carregar horas semanais: ${errorData.message || 'Erro desconhecido'}`, true);
            return null;
        }
    } catch (error) {
        console.error('Erro de rede ao buscar dados de horas semanais:', error);
        displayDashboardMessage(`Erro de rede para horas semanais: ${error.message}`, true);
        return null;
    }
}

async function fetchPresenceStatusData() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.warn('Token de acesso não encontrado para status de presença. Redirecionando para login.');
        return null;
    }

    try {
        console.log('--- Buscando Dados de Status de Presença ---');
        // Suponha que o backend retorne { presentes: 10, ausentes: 2, atrasados: 1 }
        const response = await fetch(`${API_BASE_URL}/dashboard/presence-status`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Dados de Status de Presença:', data);
            return data;
        } else if (response.status === 401 || response.status === 403) {
            console.error('Erro de autenticação/autorização ao buscar status de presença.');
            displayDashboardMessage('Não autorizado a acessar dados de status de presença.', true);
            return null;
        } else {
            const errorData = await response.json();
            console.error('Erro ao buscar dados de status de presença:', response.status, errorData.message);
            displayDashboardMessage(`Erro ao carregar status de presença: ${errorData.message || 'Erro desconhecido'}`, true);
            return null;
        }
    } catch (error) {
        console.error('Erro de rede ao buscar dados de status de presença:', error);
        displayDashboardMessage(`Erro de rede para status de presença: ${error.message}`, true);
        return null;
    }
}

// --- Funções para Renderizar Gráficos ---

function renderWeeklyHoursChart(data) {
    if (!DOM.weeklyHoursChartCanvas) {
        console.error('Canvas para o gráfico de horas semanais não encontrado.');
        return;
    }

    if (weeklyHoursChartInstance) {
        weeklyHoursChartInstance.destroy(); // Destrói instância anterior para evitar duplicidade
    }

    const ctx = DOM.weeklyHoursChartCanvas.getContext('2d');
    weeklyHoursChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels || [], // Ex: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
            datasets: [{
                label: 'Horas Trabalhadas',
                data: data.data || [], // Ex: [8, 7.5, 9, 8, 7, 0, 0]
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 2,
                tension: 0.3, // Curva suave
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Horas'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Dia da Semana'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: false,
                    text: 'Horas Trabalhadas na Semana'
                }
            }
        }
    });
}

function renderPresenceStatusChart(data) {
    if (!DOM.presenceStatusChartCanvas) {
        console.error('Canvas para o gráfico de status de presença não encontrado.');
        return;
    }

    if (presenceStatusChartInstance) {
        presenceStatusChartInstance.destroy(); // Destrói instância anterior para evitar duplicidade
    }

    const ctx = DOM.presenceStatusChartCanvas.getContext('2d');
    presenceStatusChartInstance = new Chart(ctx, {
        type: 'pie', // Ou 'doughnut' para um anel
        data: {
            labels: ['Presentes', 'Ausentes', 'Atrasados'],
            datasets: [{
                data: [data.presentes || 0, data.ausentes || 0, data.atrasados || 0],
                backgroundColor: [
                    '#28a745', // Verde para Presentes
                    '#dc3545', // Vermelho para Ausentes
                    '#ffc107'  // Amarelo para Atrasados
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false,
                    text: 'Status de Presença Hoje'
                }
            }
        }
    });
}

// --- Função de Inicialização do Dashboard ---

async function initializeDashboard() {
    // 1. Tentar obter e validar o token e a role do usuário
    const token = localStorage.getItem('accessToken');
    if (!token) {
        displayDashboardMessage('Sessão não encontrada. Redirecionando para o login.', true);
        setTimeout(logoutAndRedirect, 2000);
        return;
    }

    // Verificar a role do usuário (ex: se é ADMIN)
    // Isso é crucial para dashboards administrativos.
    // Você pode ter um endpoint específico para validar a role ou usar o endpoint de perfil.
    try {
        const profileRes = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        const profileData = await profileRes.json();
        if (!profileRes.ok || profileData.role !== 'ADMIN') { // ALERTA: Ajuste 'ADMIN' para a role que deve acessar o dashboard
            displayDashboardMessage('Você não tem permissão para acessar este dashboard.', true);
            setTimeout(logoutAndRedirect, 2000);
            return;
        }
    } catch (error) {
        console.error('Erro ao verificar permissão do usuário:', error);
        displayDashboardMessage('Erro ao verificar permissões. Redirecionando para o login.', true);
        setTimeout(logoutAndRedirect, 2000);
        return;
    }


    // 2. Buscar e exibir as métricas
    await fetchDashboardMetrics();

    // 3. Buscar e renderizar o gráfico de horas semanais
    const weeklyHoursData = await fetchWeeklyHoursData();
    if (weeklyHoursData) {
        renderWeeklyHoursChart(weeklyHoursData);
    }

    // 4. Buscar e renderizar o gráfico de status de presença
    const presenceStatusData = await fetchPresenceStatusData();
    if (presenceStatusData) {
        renderPresenceStatusChart(presenceStatusData);
    }

    console.log('Dashboard inicializado com sucesso!');
}

// --- Event Listener para Carregamento do DOM ---
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Opcional: Adicionar um botão de logout no dashboard se não houver um
// Exemplo:
/*
const logoutButton = document.getElementById('logout-dashboard-btn');
if (logoutButton) {
    logoutButton.addEventListener('click', logoutAndRedirect);
}
*/