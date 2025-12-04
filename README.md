# 📚 AulaLivre

**AulaLivre** é uma plataforma web de voluntariado educacional que conecta professores dispostos a doar seu tempo e conhecimento a alunos que precisam de reforço escolar.

O sistema permite o cadastro de usuários (Alunos e Professores), gerenciamento de disponibilidade de horários e agendamento de aulas via painel interativo.

---

## 🚀 Funcionalidades

* **Autenticação:** Sistema de Login e Cadastro (Diferenciação entre Aluno e Professor).
* **Para Professores:**
    * Cadastro de horários disponíveis.
    * Painel de gestão de solicitações (Aceitar/Rejeitar aulas).
    * Visualização da agenda.
* **Para Alunos:**
    * Busca de professores por disciplina.
    * Agendamento de aulas.
    * Visualização de aulas confirmadas.
* **API Rest:** Backend robusto construído com Django Rest Framework.

---

## 🛠 Tecnologias Utilizadas

* **Backend:** Python 3, Django, Django Rest Framework.
* **Frontend:** JavaScript (Vanilla), HTML5, CSS3, Bootstrap 5.
* **Banco de Dados:** SQLite (Padrão local para desenvolvimento).
* **Controle de Versão:** Git / GitHub.

---

## ⚙️ Como rodar o projeto localmente

Siga este passo a passo para configurar o ambiente de desenvolvimento na sua máquina.

### 1. Pré-requisitos
Certifique-se de ter instalado:
* [Python](https://www.python.org/) (versão 3.8 ou superior)
* [Git](https://git-scm.com/)

### 2. Clonar o repositório

Abra o terminal e clone este projeto:

```bash
git clone [https://github.com/SEU-USUARIO/aula-livre.git](https://github.com/SEU-USUARIO/aula-livre.git
cd Aula_Livre
(Substitua SEU-USUARIO pelo seu usuário real do GitHub)

3. Criar e ativar o ambiente virtual (Venv)
É recomendável usar um ambiente virtual para isolar as dependências.

No Windows:

Bash

python -m venv venv
.\venv\Scripts\activate
No Linux ou Mac:

Bash

python3 -m venv venv
source venv/bin/activate
4. Instalar as dependências
Instale todas as bibliotecas listadas no requirements.txt:

Bash

pip install -r requirements.txt
5. Configurar o Banco de Dados ⚠️ (Importante)
Por questões de segurança e boas práticas, o banco de dados original não é versionado no Git. Você precisa criar um banco local novo:

Crie as tabelas no banco de dados:

Bash

python manage.py migrate
Crie o seu usuário Administrador: Como o banco é novo, você precisa criar um superusuário para acessar o painel administrativo (/admin):

Bash

python manage.py createsuperuser
(Preencha com seu nome, e-mail e uma senha de sua preferência).

6. Executar o servidor
Com tudo configurado, inicie o servidor local:

Bash

python manage.py runserver
O projeto estará disponível em:

Aplicação: http://127.0.0.1:8000/

Painel Admin: http://127.0.0.1:8000/admin/

📂 Estrutura do Projeto
core/: Contém a lógica do Backend (Models, Views, Serializers).

static/: Contém os arquivos de Frontend (CSS, Imagens e Scripts JS).

js/views/: Lógica específica de cada tela (Home, Dashboard, Explorar).

js/router.js: Gerenciador de rotas do Frontend (Single Page Application behavior).

templates/: Arquivos HTML base.

🤝 Como contribuir
Faça um Fork do projeto.

Crie uma Branch para sua feature (git checkout -b feature/nova-feature).

Faça o Commit das suas mudanças (git commit -m 'Adiciona nova feature').

Faça o Push para a Branch (git push origin feature/nova-feature).

Abra um Pull Request.
