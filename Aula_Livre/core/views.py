from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Disciplina, Agendamento, Avaliacao, Usuario, Disponibilidade
from .serializers import (
    DisciplinaSerializer, 
    AgendamentoSerializer, 
    AvaliacaoSerializer, 
    UsuarioSerializer, 
    DisponibilidadeSerializer
)

# ViewSet para Gerenciar Disciplinas (Aqui você cria: Matemática, História, etc.)
class DisciplinaViewSet(viewsets.ModelViewSet):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer

# ViewSet genérico para Usuários (Admins, Alunos e Professores)
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

# ViewSet específico para listar apenas Professores
class ProfessorViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.filter(tipo='PROFESSOR')
    serializer_class = UsuarioSerializer

class DisponibilidadeViewSet(viewsets.ModelViewSet):
    queryset = Disponibilidade.objects.all()
    serializer_class = DisponibilidadeSerializer

class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    
    def get_queryset(self):
        """
        Permite filtrar agendamentos por aluno ou professor via URL
        Ex: /api/agendamentos/?aluno_id=1
        """
        queryset = Agendamento.objects.all()
        aluno_id = self.request.query_params.get('aluno_id')
        prof_id = self.request.query_params.get('professor_id')
        
        if aluno_id:
            queryset = queryset.filter(aluno_id=aluno_id)
        if prof_id:
            queryset = queryset.filter(disponibilidade__professor_id=prof_id)
            
        return queryset

class AvaliacaoViewSet(viewsets.ModelViewSet):
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer

# --- VIEWS DE AUTENTICAÇÃO E CADASTRO ---

@api_view(['POST'])
def cadastro_usuario(request):
    """
    Endpoint dedicado ao cadastro (Signup).
    Usa o UsuarioSerializer corrigido para tratar a senha.
    """
    serializer = UsuarioSerializer(data=request.data)
        
    if serializer.is_valid():
        # O método .save() vai chamar o create() do Serializer, 
        # que agora criptografa a senha corretamente.
        user = serializer.save()
        
        return Response({
            'id': user.id,
            'nome': user.nome,
            'email': user.email,
            'tipo': user.tipo
        }, status=status.HTTP_201_CREATED)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_usuario(request):
    """
    Endpoint simples de Login.
    """
    email = request.data.get('email')
    senha = request.data.get('senha')
    
    try:
        user = Usuario.objects.get(email=email)
        # check_password funciona porque usamos set_password no cadastro
        if user.check_password(senha):
            return Response({
                'id': user.id,
                'nome': user.nome,
                'email': user.email,
                'tipo': user.tipo
            })
        else:
            return Response({'detail': 'Senha incorreta.'}, status=status.HTTP_401_UNAUTHORIZED)
            
    except Usuario.DoesNotExist:
        return Response({'detail': 'Usuário não encontrado.'}, status=status.HTTP_401_UNAUTHORIZED)