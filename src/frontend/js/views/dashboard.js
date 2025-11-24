// js/views/dashboard.js

import { authService } from '../services/auth.js';

// --- DADOS MOCKADOS ---

const mockAulasAluno = [
    { id: 1, professor: "Ana Pereira", materia: "Inglês", data: "Terça - 19:00", status: "Confirmada", cor: "bg-success" },
    { id: 2, professor: "Carlos Silva", materia: "Matemática", data: "Quarta - 16:00", status: "Pendente", cor: "bg-warning text-dark" },
    // Aula concluída mas não avaliada (mostra botão avaliar)
    { id: 3, professor: "Roberto Campos", materia: "Física", data: "Ontem", status: "Concluído", cor: "bg-secondary", avaliado: false },
    // Aula já avaliada (mostra certificado)
    { id: 4, professor: "Júlia Costa", materia: "Redação", data: "Semana passada", status: "Concluído", cor: "bg-secondary", avaliado: true }
];

export const mockHorariosProfessor = [
    { id: 1, dia: "Segunda", hora: "14:00", status: "Livre", aluno: "-", cor: "bg-info text-dark" },
    { id: 2, dia: "Quarta", hora: "10:00", status: "Agendado", aluno: "Joãozinho", cor: "bg-primary" },
    { id: 3, dia: "Sexta", hora: "18:00", status: "Concluído", aluno: "Maria", cor: "bg-success" }
];

// --- FUNCOES AUXILIARES ---

// Lógica das Estrelas 
window.selecionarEstrela = function(nota) {
    // salva a nota no input escondido
    document.getElementById('nota-final').value = nota;

    // pinta as estrelas
    const estrelas = document.querySelectorAll('.estrela-interativa');
    estrelas.forEach(estrela => {
        const valorEstrela = parseInt(estrela.getAttribute('data-nota'));
        if (valorEstrela <= nota) {
            estrela.classList.remove('bi-star');
            estrela.classList.add('bi-star-fill'); // estrela cheia
        } else {
            estrela.classList.remove('bi-star-fill');
            estrela.classList.add('bi-star'); // estrela vazia
        }
    });
}

// Abre o modal de avaliação
window.abrirAvaliacao = function(nomeProfessor) {
    document.getElementById('nome-avaliado').innerText = nomeProfessor;
    // reseta as estrelas
    window.selecionarEstrela(0);
    
    const modalEl = document.getElementById('modal-avaliacao');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

// Abre o modal de certificado
window.verCertificado = function(nomePessoa, materia) {
    document.getElementById('cert-nome-pessoa').innerText = nomePessoa;
    document.getElementById('cert-materia').innerText = materia;
    
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    document.getElementById('cert-data').innerText = dataHoje;

    const modalEl = document.getElementById('modal-certificado');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

// funcao pra adicionar na lista fake
export function adicionarHorarioMock(dia, hora) {
    mockHorariosProfessor.push({
        id: Date.now(),
        dia: dia,
        hora: hora,
        status: "Livre",
        aluno: "-",
        cor: "bg-info text-dark"
    });
}

// --- ALUNO ---

function gerarTabelaAluno() {
    if (mockAulasAluno.length === 0) {
        return `<tr><td colspan="4" class="text-center text-muted">Nenhuma aula encontrada.</td></tr>`;
    }
    return mockAulasAluno.map(aula => {
        let botaoAcao = '';
        
        if (aula.status === 'Concluído') {
            // Se ja avaliou, libera certificado. Se nao, pede avaliacao.
            if (aula.avaliado) {
                const nomeUsuario = authService.getUsuario().nome;
                botaoAcao = `
                    <button class="btn btn-sm btn-outline-dark" onclick="window.verCertificado('${nomeUsuario}', '${aula.materia}')">
                        <i class="bi bi-award"></i> Certificado
                    </button>
                `;
            } else {
                botaoAcao = `
                    <button class="btn btn-sm btn-warning text-dark fw-bold" onclick="window.abrirAvaliacao('${aula.professor}')">
                        <i class="bi bi-star-fill"></i> Avaliar
                    </button>
                `;
            }
        } else {
            botaoAcao = `<button class="btn btn-sm btn-outline-primary"><i class="bi bi-camera-video-fill"></i> Link</button>`;
        }

        return `
        <tr>
            <td>
                <div class="fw-bold">${aula.materia}</div>
                <small class="text-muted">Prof. ${aula.professor}</small>
            </td>
            <td class="align-middle">${aula.data}</td>
            <td class="align-middle"><span class="badge ${aula.cor}">${aula.status}</span></td>
            <td class="text-end align-middle">
                ${botaoAcao}
            </td>
        </tr>
        `;
    }).join('');
}

function renderPainelAluno(usuario) {
    return `
    <div class="container py-5">
        <div class="row mb-4 align-items-center">
            <div class="col">
                <h2 class="fw-bold text-primary">Área do Aluno</h2>
                <p class="text-muted">Bons estudos, <strong>${usuario.nome}</strong>!</p>
            </div>
            <div class="col-auto">
                <button class="btn botao-verde" data-route="explorar">
                    <i class="bi bi-search me-1"></i> Buscar Professor
                </button>
            </div>
        </div>

        <div class="row mb-5">
            <div class="col-md-4 mb-3">
                <div class="card border-0 shadow-sm p-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-light p-3 rounded-circle me-3 text-primary"><i class="bi bi-journal-bookmark fs-4"></i></div>
                        <div><h6 class="mb-0 text-muted">Aulas Marcadas</h6><h3 class="fw-bold mb-0">4</h3></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card border-0 shadow-sm p-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-light p-3 rounded-circle me-3 text-success"><i class="bi bi-clock-history fs-4"></i></div>
                        <div><h6 class="mb-0 text-muted">Horas Estudadas</h6><h3 class="fw-bold mb-0">12h</h3></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3"><h5 class="mb-0 fw-bold">Minhas Aulas</h5></div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr><th class="ps-4">Matéria</th><th>Data</th><th>Status</th><th class="text-end pe-4">Ação</th></tr>
                        </thead>
                        <tbody class="ps-4">${gerarTabelaAluno()}</tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
}

// --- PROFESSOR ---

function gerarTabelaProfessor() {
    if (mockHorariosProfessor.length === 0) {
        return `<tr><td colspan="4" class="text-center text-muted">Você não cadastrou horários livres.</td></tr>`;
    }
    return mockHorariosProfessor.map(item => `
        <tr>
            <td><div class="fw-bold">${item.dia}</div></td>
            <td>${item.hora}</td>
            <td>
                <span class="badge ${item.cor}">${item.status}</span>
                ${item.aluno !== '-' ? `<small class="d-block text-muted">Aluno: ${item.aluno}</small>` : ''}
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderPainelProfessor(usuario) {
    return `
    <div class="container py-5">
        <div class="row mb-4 align-items-center">
            <div class="col">
                <h2 class="fw-bold text-primary">Painel do Professor</h2>
                <p class="text-muted">Obrigado por compartilhar conhecimento, <strong>${usuario.nome}</strong>!</p>
            </div>
            <div class="col-auto">
                <button class="btn botao-verde" data-bs-toggle="modal" data-bs-target="#modal-novo-horario">
                    <i class="bi bi-plus-circle me-1"></i> Novo Horário
                </button>
            </div>
        </div>

        <div class="row mb-5">
            <div class="col-md-4 mb-3">
                <div class="card border-0 shadow-sm p-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-light p-3 rounded-circle me-3 text-warning"><i class="bi bi-people fs-4"></i></div>
                        <div><h6 class="mb-0 text-muted">Alunos Atendidos</h6><h3 class="fw-bold mb-0">15</h3></div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card border-0 shadow-sm p-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-light p-3 rounded-circle me-3 text-info"><i class="bi bi-patch-check fs-4"></i></div>
                        <div><h6 class="mb-0 text-muted">Horas Voluntárias</h6><h3 class="fw-bold mb-0">24h</h3></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3"><h5 class="mb-0 fw-bold">Gerenciar Disponibilidade</h5></div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr><th class="ps-4">Dia</th><th>Horário</th><th>Status</th><th class="text-end pe-4">Ação</th></tr>
                        </thead>
                        <tbody class="ps-4">${gerarTabelaProfessor()}</tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
}

export function obterConteudoDashboard() {
    const usuario = authService.getUsuario();
    if (!usuario) return '';

    if (usuario.tipo === 'professor') {
        return renderPainelProfessor(usuario);
    } else {
        return renderPainelAluno(usuario);
    }
}