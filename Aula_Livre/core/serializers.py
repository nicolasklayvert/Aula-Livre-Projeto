from rest_framework import serializers
from .models import Disciplina, Agendamento, Avaliacao

class DisciplinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disciplina
        fields = ['id', 'nome', 'descricao']

class AgendamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agendamento
        fields = '__all__'

class AvaliacaoSerializer(serializers.ModelSerializer):
    # Campos extras para facilitar a exibição no front
    nome_aluno = serializers.CharField(source='agendamento.aluno.nome', read_only=True)
    nome_professor = serializers.CharField(source='agendamento.disponibilidade.professor.nome', read_only=True)
    disciplina_nome = serializers.CharField(source='agendamento.disciplina.nome', read_only=True)

    class Meta:
        model = Avaliacao
        fields = ['id', 'agendamento', 'nota', 'comentario', 'criado_em', 'nome_aluno', 'nome_professor', 'disciplina_nome']