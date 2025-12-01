// js/views/home.js

import { authService } from '../services/auth.js';

// --- TELA 1: VISITANTE ---
function renderHomeVisitante() {
    // retorna o htmlzao estatico da home.
    // no futuro se precisar de dados dinamicos (tipo "professores destaque")
    // a gente transforma isso numa funcao async igual a do explorar
    return `
    <header class="py-5 bg-white">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="display-5 fw-bold text-primary mb-3">A Ponte do Conhecimento Voluntário.</h1>
                    <p class="lead mb-4">Conectamos professores que querem doar conhecimento a alunos que precisam de apoio gratuito e estruturado.</p>
                    
                    <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                        <button type="button" data-route="explorar" class="btn botao-verde btn-lg px-4 me-md-2">
                            Encontrar Professor
                        </button>
                        
                        <button type="button" 
                                class="btn btn-outline-secondary btn-lg px-4"
                                data-bs-toggle="modal" 
                                data-bs-target="#modal-cadastro"
                                onclick="document.getElementById('cad-tipo').value='professor'">
                            Sou Professor
                        </button>
                    </div>
                </div>
                
                <div class="col-lg-6 d-none d-lg-block text-center">
                    <i class="bi bi-people-fill text-primary" style="font-size: 10rem; opacity: 0.2;"></i>
                </div>
            </div>
        </div>
    </header>

    <section class="py-5 bg-light">
        <div class="container">
            <h2 class="text-center mb-5 fw-bold text-primary">Como funciona</h2>
            <div class="row text-center">
                
                <div class="col-md-4 mb-4">
                    <div class="card h-100 border-0 shadow-sm p-4">
                        <div class="card-body">
                            <i class="bi bi-search display-4 text-primary mb-3"></i>
                            <h5 class="card-title fw-bold">Busque</h5>
                            <p class="card-text text-muted">Encontre professores voluntários na disciplina que você precisa.</p>
                        </div>
                    </div>
                </div>

                <div class="col-md-4 mb-4">
                    <div class="card h-100 border-0 shadow-sm p-4">
                        <div class="card-body">
                            <i class="bi bi-calendar-check display-4 text-primary mb-3"></i>
                            <h5 class="card-title fw-bold">Agende</h5>
                            <p class="card-text text-muted">Escolha o melhor horário e garanta sua aula de reforço.</p>
                        </div>
                    </div>
                </div>

                <div class="col-md-4 mb-4">
                    <div class="card h-100 border-0 shadow-sm p-4">
                        <div class="card-body">
                            <i class="bi bi-award display-4 text-primary mb-3"></i>
                            <h5 class="card-title fw-bold">Aprenda</h5>
                            <p class="card-text text-muted">Tenha aulas de qualidade e evolua nos seus estudos.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>
    `;
}

// --- TELA 2: ALUNO LOGADO ---
function renderHomeAluno(usuario) {
    return `
    <div class="container py-5">
        <div class="row justify-content-center text-center">
            <div class="col-lg-8">
                <h1 class="fw-bold text-primary mb-3">Olá, ${usuario.nome.split(' ')[0]}! 👋</h1>
                <p class="lead text-muted mb-5">O que você quer aprender hoje?</p>
                
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="card h-100 border-0 shadow-sm hover-effect p-4" style="cursor: pointer;" data-route="explorar">
                            <div class="card-body">
                                <div class="bg-light p-3 rounded-circle d-inline-block mb-3 text-primary">
                                    <i class="bi bi-search fs-1"></i>
                                </div>
                                <h4 class="fw-bold">Buscar Aulas</h4>
                                <p class="text-muted small">Encontre professores de Matemática, Inglês e mais.</p>
                                <button class="btn btn-outline-primary w-100 mt-2" data-route="explorar">Ir para Busca</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card h-100 border-0 shadow-sm hover-effect p-4" style="cursor: pointer;" data-route="dashboard">
                            <div class="card-body">
                                <div class="bg-light p-3 rounded-circle d-inline-block mb-3 text-success">
                                    <i class="bi bi-journal-check fs-1"></i>
                                </div>
                                <h4 class="fw-bold">Meu Painel</h4>
                                <p class="text-muted small">Veja suas próximas aulas agendadas.</p>
                                <button class="btn btn-outline-success w-100 mt-2" data-route="dashboard">Ver Minhas Aulas</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// --- TELA 3: PROFESSOR LOGADO ---
function renderHomeProfessor(usuario) {
    return `
    <div class="container py-5">
        <div class="row justify-content-center text-center">
            <div class="col-lg-8">
                <h1 class="fw-bold text-primary mb-3">Bem vindo, Prof. ${usuario.nome.split(' ')[0]}!</h1>
                <p class="lead text-muted mb-5">Obrigado por fazer a diferença na educação.</p>
                
                <div class="card border-0 shadow-sm p-5">
                    <div class="card-body">
                        <i class="bi bi-calendar-week text-primary mb-3" style="font-size: 4rem;"></i>
                        <h3 class="fw-bold mt-3">Gerenciar Agenda</h3>
                        <p class="text-muted">Cadastre seus horários livres para que os alunos possam te encontrar.</p>
                        
                        <button class="btn botao-verde btn-lg px-5 mt-3" data-route="dashboard">
                            Ir para meu Painel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// --- FUNÇÃO PRINCIPAL ---
export function obterConteudoHome() {
    const usuario = authService.getUsuario();

    // Se nao tiver ninguem, mostra a capa do site (visitante)
    if (!usuario) {
        return renderHomeVisitante();
    }

    // Se tiver logado, verifica o tipo pra mostrar a home certa
    if (usuario.tipo === 'professor') {
        return renderHomeProfessor(usuario);
    } else {
        return renderHomeAluno(usuario);
    }
}