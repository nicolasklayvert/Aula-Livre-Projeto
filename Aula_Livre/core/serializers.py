from rest_framework import serializers
from .models import Disciplina, Agendamento, Avaliacao, Usuario, Disponibilidade

class DisciplinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disciplina
        fields = ['id', 'nome', 'descricao']

class DisponibilidadeSerializer(serializers.ModelSerializer):
    disciplina_nome = serializers.CharField(source='disciplina.nome', read_only=True)
    professor_nome = serializers.CharField(source='professor.nome', read_only=True)
    
    class Meta:
        model = Disponibilidade
        fields = ['id', 'professor', 'professor_nome', 'disciplina', 'disciplina_nome', 'assunto', 'nivel', 'descricao', 'link', 'data', 'horario_inicio', 'disponivel']

class UsuarioSerializer(serializers.ModelSerializer):
    disciplinas = serializers.StringRelatedField(many=True, read_only=True)
    disponibilidades = DisponibilidadeSerializer(source='disponibilidade_set', many=True, read_only=True)
    senha = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'senha', 'tipo', 'disciplinas', 'disponibilidades']

    def create(self, validated_data):
        password = validated_data.pop('senha', None)
        
        if 'email' in validated_data and 'username' not in validated_data:
            validated_data['username'] = validated_data['email']
        
        instance = self.Meta.model(**validated_data)
        
        if password is not None:
            instance.set_password(password)
        
        instance.save()
        return instance

class AvaliacaoSerializer(serializers.ModelSerializer):
    nome_aluno = serializers.CharField(source='agendamento.aluno.nome', read_only=True)
    nome_professor = serializers.CharField(source='agendamento.disponibilidade.professor.nome', read_only=True)
    disciplina_nome = serializers.CharField(source='agendamento.disponibilidade.disciplina.nome', read_only=True)

    class Meta:
        model = Avaliacao
        # ADICIONADO: 'tipo_avaliador' para saber se foi aluno ou professor
        fields = ['id', 'agendamento', 'nota', 'comentario', 'tipo_avaliador', 'criado_em', 'nome_aluno', 'nome_professor', 'disciplina_nome']

class AgendamentoSerializer(serializers.ModelSerializer):
    disciplina_nome = serializers.SerializerMethodField()
    professor_nome = serializers.CharField(source='disponibilidade.professor.nome', read_only=True)
    aluno_nome = serializers.CharField(source='aluno.nome', read_only=True)
    data = serializers.DateField(source='disponibilidade.data', read_only=True)
    hora = serializers.TimeField(source='disponibilidade.horario_inicio', read_only=True)
    
    # Este campo estava definido mas faltava no Meta
    assunto = serializers.ReadOnlyField(source='disponibilidade.assunto')
    link_aula = serializers.SerializerMethodField()
    avaliacao = serializers.SerializerMethodField()

    class Meta:
        model = Agendamento
        # CORREÇÃO CRÍTICA AQUI: Adicionado 'assunto' na lista
        fields = ['id', 'aluno', 'disponibilidade', 'disciplina_nome', 'professor_nome', 'aluno_nome', 'data', 'hora', 'status', 'assunto', 'link_aula', 'avaliacao']
        # Remove validação automática de duplicidade para permitir reativar agendamentos
        validators = []

    def create(self, validated_data):
        aluno = validated_data.get('aluno')
        disponibilidade = validated_data.get('disponibilidade')

        agendamento_existente = Agendamento.objects.filter(
            aluno=aluno, 
            disponibilidade=disponibilidade
        ).first()

        if agendamento_existente:
            if agendamento_existente.status == 'CANCELADO':
                if not disponibilidade.disponivel:
                     raise serializers.ValidationError("Horário não disponível.")

                agendamento_existente.status = 'AGENDADO'
                agendamento_existente.save() 
                
                disponibilidade.disponivel = False
                disponibilidade.save()
                
                return agendamento_existente
            
            raise serializers.ValidationError("Agendamento já existe para este horário.")

        return super().create(validated_data)

    def get_disciplina_nome(self, obj):
        if obj.disponibilidade and obj.disponibilidade.disciplina:
            return obj.disponibilidade.disciplina.nome
        return "Tira-Dúvidas / Geral"

    def get_link_aula(self, obj):
        if obj.status in ['CONFIRMADO', 'CONCLUIDO']:
            return obj.disponibilidade.link
        return None

    def get_avaliacao(self, obj):
        # CORREÇÃO: Como mudou para ForeignKey, usa-se avaliacao_set
        # Pega a primeira avaliação que encontrar (seja do aluno ou professor)
        avaliacao = obj.avaliacao_set.first()
        if avaliacao:
            return AvaliacaoSerializer(avaliacao).data
        return None