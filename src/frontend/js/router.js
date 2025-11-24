// js/router.js

import { obterConteudoHome } from './views/home.js';
import { obterConteudoExplorar } from './views/explorar.js';
import { obterConteudoDashboard, adicionarHorarioMock } from './views/dashboard.js'; // <--- importei a funcao de add mock
import { authService } from './services/auth.js'; 

// lista das rotas do app.
// se criar tela nova, tem q registrar aqui, senao o sistema ignora
const rotas = {
    '/': obterConteudoHome,
    'home': obterConteudoHome,
    'explorar': obterConteudoExplorar,
    'dashboard': obterConteudoDashboard // <--- registrei a rota vip aqui
};

// lista de rotas que so usuario logado pode ver
const rotasProtegidas = ['dashboard'];

// funcao q faz a SPA (troca o conteudo).
// ta fechada aqui dentro pra ninguem conseguir chamar pelo console do navegador
function navegar(rota) {
    
    // SEGURANCA: se tentar acessar area vip sem cracha, barra o cara
    if (rotasProtegidas.includes(rota) && !authService.usuarioEstaLogado()) {
        mostrarNotificacao('Epa! Precisa fazer login pra acessar essa página.', 'erro');
        navegar('home'); // chuta de volta pra home
        
        // ja abre o modal na cara dele pra facilitar a vida
        const modalEl = document.getElementById('modal-entrar');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        return; // para tudo por aqui
    }

    const app = document.getElementById('conteudo-principal');
    
    // fail-safe: se a rota nao existe ou ta quebrada, joga pra home 
    // pra nao ficar aquela tela branca feia pro usuario
    const viewRender = rotas[rota] || rotas['home'];
    
    // injeta o html novo
    app.innerHTML = viewRender();
    
    // ATUALIZA A URL (NOVO!): Isso faz o navegador lembrar onde vc ta (poe o # na url)
    window.location.hash = rota;
    
    // força o scroll pra cima, senao qdo troca de pagina continua lá no rodapé
    window.scrollTo(0, 0);
}

// --- FUNCOES DE UI (Interface) ---

// funcao nova pra pintar o toast de verde (sucesso) ou vermelho (erro)
// o 'tipo' define a cor. se nao passar nada, assume que é sucesso
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const toastEl = document.getElementById('toast-sistema');
    const toastIcone = document.getElementById('toast-icone');
    const toastMsg = document.getElementById('toast-mensagem');

    if (!toastEl) return; // seguranca caso o html mude

    // define a cor e o icone baseado no tipo
    if (tipo === 'sucesso') {
        toastEl.className = 'toast align-items-center text-white border-0 bg-success';
        toastIcone.className = 'bi bi-check-circle-fill me-2';
    } else {
        toastEl.className = 'toast align-items-center text-white border-0 bg-danger';
        toastIcone.className = 'bi bi-exclamation-triangle-fill me-2';
    }

    toastMsg.innerText = mensagem;

    // mostra na tela usando o bootstrap
    const toastBootstrap = new bootstrap.Toast(toastEl);
    toastBootstrap.show();
}

// essa funcao esconde o botao 'entrar' e mostra o menu do usuario se ele tiver logado
function atualizarNavbar() {
    const usuario = authService.getUsuario();
    const navVisitante = document.getElementById('nav-visitante');
    const navLogado = document.getElementById('nav-logado');
    const spanNome = document.getElementById('nome-usuario-nav');
    const linkExplorar = document.getElementById('link-explorar'); // peguei o link pelo ID novo

    if (usuario) {
        // ta logado: esconde visitante, mostra logado e bota o nome dele lá
        navVisitante.classList.add('d-none');
        navLogado.classList.remove('d-none');
        spanNome.innerText = usuario.nome.split(' ')[0]; // pega so o primeiro nome

        // se for professor, esconde o botao de explorar pq ele nao precisa
        if (usuario.tipo === 'professor') {
            linkExplorar.classList.add('d-none');
        } else {
            linkExplorar.classList.remove('d-none');
        }

    } else {
        // nao ta logado: volta ao normal
        navVisitante.classList.remove('d-none');
        navLogado.classList.add('d-none');
        linkExplorar.classList.remove('d-none'); // visitante ve tudo
    }
}

// ve o submit do form de login
function configurarLogin() {
    const formLogin = document.getElementById('form-login');
    
    if (!formLogin) return; // se nao tiver modal na tela, ignora

    //clonar o elemento remove os listeners antigos pra nao duplicar
    const novoForm = formLogin.cloneNode(true);
    formLogin.parentNode.replaceChild(novoForm, formLogin);

    novoForm.addEventListener('submit', (e) => {
        e.preventDefault(); // segura o refresh

        const email = document.getElementById('campo-email').value;
        const senha = document.getElementById('campo-senha').value;

        // chama o service pra ver se a senha bate
        const resultado = authService.logar(email, senha);

        if (resultado.sucesso) {
            // fecha o modal na marra usando bootstrap
            const modalEl = document.getElementById('modal-entrar');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            // atualiza a tela e avisa
            atualizarNavbar();
            
            // troquei o alert pelo toast novo
            mostrarNotificacao(`Bem vindo de volta, ${authService.getUsuario().nome}!`, 'sucesso');

            // UX: logou, vai pra home personalizada (MUDANÇA AQUI)
            navegar('home');
        } else {
            // avisa que deu ruim em vermelho
            mostrarNotificacao(resultado.erro, 'erro');
        }
    });
}

// configura o submit do cadastro 
function configurarCadastro() {
    const formCadastro = document.getElementById('form-cadastro');
    if (!formCadastro) return; 

    // mesmo esquema do login pra limpar listeners
    const novoForm = formCadastro.cloneNode(true);
    formCadastro.parentNode.replaceChild(novoForm, formCadastro);

    novoForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const nome = document.getElementById('cad-nome').value;
        const email = document.getElementById('cad-email').value;
        const senha = document.getElementById('cad-senha').value;
        const tipo = document.getElementById('cad-tipo').value;

        // chama o service pra registrar
        const resultado = authService.registrar(nome, email, senha, tipo);

        if (resultado.sucesso) {
            // fecha o modal de cadastro
            const modalEl = document.getElementById('modal-cadastro');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            atualizarNavbar();
            mostrarNotificacao(`Conta criada! Bem vindo, ${nome}.`, 'sucesso');
            
            // UX: cadastro feito, vai pra home personalizada 
            navegar('home');
        }
    });
}

// configura o submit do novo horario (PROFESSOR)
function configurarGestaoHorarios() {
    const formHorario = document.getElementById('form-novo-horario');
    if (!formHorario) return; // se nao tiver o modal, nao faz nada

    const novoForm = formHorario.cloneNode(true);
    formHorario.parentNode.replaceChild(novoForm, formHorario);

    novoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const dia = document.getElementById('horario-dia').value;
        const hora = document.getElementById('horario-hora').value;

        // adiciona na lista fake lá da dashboard.js
        adicionarHorarioMock(dia, hora);

        // fecha o modal
        const modalEl = document.getElementById('modal-novo-horario');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        mostrarNotificacao('Horário cadastrado com sucesso!', 'sucesso');

        // recarrega o dashboard pra tabela atualizar
        navegar('dashboard');
    });
}

// configura o submit da avaliacao
function configurarAvaliacao() {
    const formAvaliacao = document.getElementById('form-avaliacao');
    if (!formAvaliacao) return;

    const novoForm = formAvaliacao.cloneNode(true);
    formAvaliacao.parentNode.replaceChild(novoForm, formAvaliacao);

    novoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nota = document.getElementById('nota-final').value;
        
        // valida se escolheu estrela
        if (nota == "0") {
            mostrarNotificacao('Selecione pelo menos 1 estrela!', 'erro');
            return;
        }

        // fecha o modal
        const modalEl = document.getElementById('modal-avaliacao');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        mostrarNotificacao('Avaliação enviada! Obrigado.', 'sucesso');
        
        // Recarrega o dashboard
        navegar('dashboard');
    });
}

// configura o clique do botao sair
function configurarLogout() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            authService.deslogar();
            atualizarNavbar();
            
            // feedback visual pro usuario saber que saiu mesmo
            mostrarNotificacao('Você saiu.', 'sucesso');
            
            navegar('home'); // chuta o cara pra home
        });
    }
}

// --- INICIALIZACAO ---

// aqui a gente usa Event Delegation pra nao sujar o html com onclick
// ve qualquer click na pagina e ve se foi num link nosso
document.addEventListener('click', (e) => {
    
    // procura se o elemento clicado (ou o pai dele) tem a tag data-route
    const link = e.target.closest('[data-route]');

    if (link) {
        e.preventDefault(); // mata o comportamento padrao do link (recarregar a pag)
        const rotaDestino = link.dataset.route;
        navegar(rotaDestino); // chama a nossa navegação interna
    }
});

// qdo o html terminar de carregar, ja chama a home direto
document.addEventListener('DOMContentLoaded', () => {
    // Tenta pegar a rota que ta escrita lá na url depois do # (ex: #dashboard)
    // O slice(1) serve pra tirar o caractere # da frente
    const rotaSalva = window.location.hash.slice(1);

    // Se tiver rota salva, usa ela. Se nao, vai pra home.
    navegar(rotaSalva || 'home');

    atualizarNavbar(); // checa se o cara ja tava logado antes
    configurarLogin();
    configurarCadastro();
    configurarGestaoHorarios(); // ativei o form do professor
    configurarAvaliacao(); // ativei o form da avaliacao
    configurarLogout();
});