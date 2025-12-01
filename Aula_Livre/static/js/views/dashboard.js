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

// MOCK DAS DISCIPLINAS DO PROFESSOR 
let minhasDisciplinasMock = ["Matemática", "Física"]; 

// --- VARIAVEIS GLOBAIS ---
let acaoPendente = null;
let idPendente = null;
let modalConfirmacaoInstance = null;

// --- FUNCOES AUXILIARES ---

// Função segura para chamar notificação
function notificarSeguro(msg, tipo) {
    if (typeof window.mostrarNotificacao === 'function') {
        window.mostrarNotificacao(msg, tipo);
    } else {
        console.warn("Toast não encontrado:", msg);
        alert(msg); 
    }
}

window.solicitarGerenciamento = function(id, acao) {
    acaoPendente = acao;
    idPendente = id;
    const txtConfirmacao = document.getElementById('texto-confirmacao');
    
    if (acao === 'concluir') txtConfirmacao.innerText = 'Deseja marcar esta aula como concluída?';
    else if (acao === 'cancelar') txtConfirmacao.innerText = 'Deseja cancelar o agendamento?';
    else if (acao === 'excluir') txtConfirmacao.innerText = 'Excluir este horário?';

    const modalEl = document.getElementById('modal-confirmacao');
    if (!modalConfirmacaoInstance) {
        modalConfirmacaoInstance = new bootstrap.Modal(modalEl);
    }
    modalConfirmacaoInstance.show();
}

window.confirmarAcaoPendente = function() {
    const index = mockHorariosProfessor.findIndex(h => h.id == idPendente);
    
    if (index !== -1) {
        const horario = mockHorariosProfessor[index];

        if (acaoPendente === 'concluir') {
            horario.status = 'Concluído';
            horario.cor = 'bg-success';
            notificarSeguro('Aula concluída!', 'sucesso');
        } 
        else if (acaoPendente === 'cancelar') {
            horario.status = 'Livre';
            horario.aluno = '-';
            horario.cor = 'bg-info text-dark';
            notificarSeguro('Cancelado.', 'sucesso');
        } 
        else if (acaoPendente === 'excluir') {
            mockHorariosProfessor.splice(index, 1);
            notificarSeguro('Horário excluído.', 'sucesso');
        }
    }

    if (modalConfirmacaoInstance) modalConfirmacaoInstance.hide();

    setTimeout(() => {
        document.getElementById('conteudo-principal').innerHTML = obterConteudoDashboard();
    }, 200);
}

window.selecionarEstrela = function(nota) { document.getElementById('nota-final').value = nota; const estrelas = document.querySelectorAll('.estrela-interativa'); estrelas.forEach(estrela => { const valorEstrela = parseInt(estrela.getAttribute('data-nota')); if (valorEstrela <= nota) { estrela.classList.remove('bi-star'); estrela.classList.add('bi-star-fill'); } else { estrela.classList.remove('bi-star-fill'); estrela.classList.add('bi-star'); } }); }
window.abrirAvaliacao = function(nomeProfessor) { document.getElementById('nome-avaliado').innerText = nomeProfessor; window.selecionarEstrela(0); const modalEl = document.getElementById('modal-avaliacao'); const modal = new bootstrap.Modal(modalEl); modal.show(); }
window.verCertificado = function(nomePessoa, materia) { document.getElementById('cert-nome-pessoa').innerText = nomePessoa; document.getElementById('cert-materia').innerText = materia; const dataHoje = new Date().toLocaleDateString('pt-BR'); document.getElementById('cert-data').innerText = dataHoje; const modalEl = document.getElementById('modal-certificado'); const modal = new bootstrap.Modal(modalEl); modal.show(); }

// Preenche o <select> do modal
export function atualizarSelectDoModal() {
    const select = document.getElementById('horario-disciplina');
    if (!select) return;
    select.innerHTML = ''; 
    if (minhasDisciplinasMock.length === 0) {
        select.innerHTML = '<option disabled selected>Selecione disciplinas no seu perfil!</option>';
    } else {
        minhasDisciplinasMock.forEach(disc => {
            const option = document.createElement('option');
            option.value = disc;
            option.innerText = disc;
            select.appendChild(option);
        });
    }
}

window.abrirModalNovoHorario = function() {
    atualizarSelectDoModal();
    const modalEl = document.getElementById('modal-novo-horario');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

export function adicionarHorarioMock(dados) {
    mockHorariosProfessor.push({
        id: Date.now(),
        dia: dados.dia,
        hora: dados.hora,
        disciplina: dados.disciplina,
        assunto: dados.assunto,
        nivel: dados.nivel,
        link: dados.link,
        status: "Livre",
        aluno: "-",
        cor: "bg-info text-dark"
    });
}

function gerarTagsDisciplinas() {
    if (minhasDisciplinasMock.length === 0) return '<span class="text-muted small">Nenhuma selecionada.</span>';
    return minhasDisciplinasMock.map(disc => `<span class="badge bg-light text-primary border me-1 mb-1">${disc}</span>`).join('');
}

export function salvarDisciplinasSelecionadas() {
    const checkboxes = document.querySelectorAll('#form-disciplinas input[type="checkbox"]:checked');
    minhasDisciplinasMock = [];
    checkboxes.forEach(chk => { minhasDisciplinasMock.push(chk.value); });
    atualizarSelectDoModal();
}

// --- RENDERIZADORES ---

function gerarTabelaAluno() {
    if (mockAulasAluno.length === 0) return `<tr><td colspan="4" class="text-center">Nenhuma aula.</td></tr>`;
    return mockAulasAluno.map(aula => `
        <tr>
            <td><div class="fw-bold">${aula.materia}</div><small class="text-muted">Prof. ${aula.professor}</small></td>
            <td class="align-middle">${aula.data}</td>
            <td class="align-middle"><span class="badge ${aula.cor}">${aula.status}</span></td>
            <td class="text-end align-middle">
                ${aula.status === 'Concluído' ? 
                  (aula.avaliado ? 
                    `<button class="btn btn-sm btn-outline-dark" onclick="window.verCertificado('${authService.getUsuario().nome}', '${aula.materia}')"><i class="bi bi-award"></i></button>` : 
                    `<button class="btn btn-sm btn-warning" onclick="window.abrirAvaliacao('${aula.professor}')"><i class="bi bi-star-fill"></i></button>`) 
                  : `<button class="btn btn-sm btn-outline-primary"><i class="bi bi-camera-video-fill"></i></button>`}
            </td>
        </tr>`).join('');
}

// AQUI ESTÁ A FUNÇÃO QUE ESTAVA FALTANDO OU COM ERRO
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

function gerarTabelaProfessor() {
    if (mockHorariosProfessor.length === 0) return `<tr><td colspan="5" class="text-center">Sem horários.</td></tr>`;
    
    return mockHorariosProfessor.map(item => {
        let acoes = '';
        if (item.status === 'Agendado') {
            acoes = `<button class="btn btn-sm btn-success me-1" onclick="window.solicitarGerenciamento(${item.id}, 'concluir')"><i class="bi bi-check-lg"></i></button>
                     <button class="btn btn-sm btn-outline-danger" onclick="window.solicitarGerenciamento(${item.id}, 'cancelar')"><i class="bi bi-trash"></i></button>`;
        } else if (item.status === 'Livre') {
            acoes = `<button class="btn btn-sm btn-outline-danger" onclick="window.solicitarGerenciamento(${item.id}, 'excluir')"><i class="bi bi-trash"></i></button>`;
        } else if (item.status === 'Concluído') {
            acoes = `<button class="btn btn-sm btn-outline-dark" onclick="window.verCertificado('${authService.getUsuario().nome}', 'Voluntariado')"><i class="bi bi-award"></i></button>`;
        }

        return `
        <tr>
            <td>
                <div class="fw-bold text-primary">${item.disciplina || 'Geral'}</div>
                <small class="text-muted">${item.assunto || ''}</small>
                ${item.nivel ? `<br><span class="badge bg-light text-secondary border" style="font-size: 0.6rem">${item.nivel}</span>` : ''}
            </td>
            <td class="align-middle">
                <div class="fw-bold">${item.dia}</div>
                <small>${item.hora}</small>
            </td>
            <td class="align-middle">
                <span class="badge ${item.cor}">${item.status}</span>
                ${item.aluno !== '-' ? `<div class="small mt-1"><i class="bi bi-person"></i> ${item.aluno}</div>` : ''}
            </td>
            <td class="text-end align-middle">${acoes}</td>
        </tr>`;
    }).join('');
}

function renderPainelProfessor(usuario) {
    // Chama a funcao pra garantir que o select do modal esteja preenchido
    setTimeout(atualizarSelectDoModal, 100);

    return `
    <div class="container py-5">
        <div class="row mb-4 align-items-center">
            <div class="col">
                <h2 class="fw-bold text-primary">Painel do Professor</h2>
                <p class="text-muted">Bem vindo, <strong>${usuario.nome}</strong>!</p>
            </div>
            <div class="col-auto">
                <button class="btn botao-verde" onclick="window.abrirModalNovoHorario()">
                    <i class="bi bi-plus-circle me-1"></i> Novo Horário
                </button>
            </div>
        </div>

        <div class="row mb-5">
            <!-- Cards... -->
            <div class="col-md-4 mb-3"><div class="card border-0 shadow-sm p-3 h-100"><div class="d-flex align-items-center"><div class="bg-light p-3 rounded-circle me-3 text-warning"><i class="bi bi-people fs-4"></i></div><div><h6 class="mb-0 text-muted">Alunos</h6><h3 class="fw-bold mb-0">15</h3></div></div></div></div>
            <div class="col-md-4 mb-3"><div class="card border-0 shadow-sm p-3 h-100"><div class="d-flex align-items-center"><div class="bg-light p-3 rounded-circle me-3 text-info"><i class="bi bi-patch-check fs-4"></i></div><div><h6 class="mb-0 text-muted">Horas</h6><h3 class="fw-bold mb-0">24h</h3></div></div></div></div>
            
            <div class="col-md-4 mb-3">
                <div class="card border-0 shadow-sm p-3 h-100">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="d-flex align-items-center">
                            <div class="bg-light p-3 rounded-circle me-3 text-primary"><i class="bi bi-book fs-4"></i></div>
                            <div><h6 class="mb-1 text-muted">Leciono:</h6><div>${gerarTagsDisciplinas()}</div></div>
                        </div>
                        <button class="btn btn-sm btn-link text-decoration-none" data-bs-toggle="modal" data-bs-target="#modal-disciplinas">Editar</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3"><h5 class="mb-0 fw-bold">Minha Agenda</h5></div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr><th class="ps-4">Conteúdo</th><th>Dia/Hora</th><th>Status</th><th class="text-end pe-4">Ação</th></tr>
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
    
    // A função renderPainelAluno está logo acima, então o erro deve sumir
    return (usuario.tipo === 'professor') ? renderPainelProfessor(usuario) : renderPainelAluno(usuario);
}