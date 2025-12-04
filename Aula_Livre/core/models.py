from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

class Usuario(AbstractUser):
    TIPO_CHOICES = [
        ('ALUNO', 'Aluno'),
        ('PROFESSOR', 'Professor'),
    ]
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'nome', 'tipo']

    def __str__(self):
        return self.nome

class Disciplina(models.Model):
    nome = models.CharField(max_length=50)
    descricao = models.TextField(blank=True, null=True)
    # CORREÇÃO AQUI: adicionado blank=True para tornar o campo opcional no cadastro
    professores = models.ManyToManyField(
        Usuario, 
        related_name='disciplinas', 
        limit_choices_to={'tipo': 'PROFESSOR'},
        blank=True 
    )

    def __str__(self):
        return self.nome

class Disponibilidade(models.Model):
    professor = models.ForeignKey(Usuario, on_delete=models.CASCADE, limit_choices_to={'tipo': 'PROFESSOR'})
    disciplina = models.ForeignKey(Disciplina, on_delete=models.SET_NULL, null=True, blank=True)
    assunto = models.CharField(max_length=100, blank=True, null=True)
    nivel = models.CharField(max_length=50, blank=True, null=True)
    descricao = models.TextField(blank=True, null=True)
    link = models.URLField(max_length=200, blank=True, null=True)
    
    data = models.DateField()
    horario_inicio = models.TimeField()
    disponivel = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.professor} - {self.data} às {self.horario_inicio}"

class Agendamento(models.Model):
    aluno = models.ForeignKey(Usuario, on_delete=models.CASCADE, limit_choices_to={'tipo': 'ALUNO'})
    disponibilidade = models.ForeignKey(Disponibilidade, on_delete=models.CASCADE)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('AGENDADO', 'Aguardando Confirmação'), 
            ('CONFIRMADO', 'Confirmado'), 
            ('CONCLUIDO', 'Concluído'), 
            ('CANCELADO', 'Cancelado')
        ],
        default='AGENDADO'
    )

    class Meta:
        unique_together = ('aluno', 'disponibilidade')

    def save(self, *args, **kwargs):
        # Verifica disponibilidade ao criar novo agendamento
        if not self.pk: 
            if not self.disponibilidade.disponivel:
                raise ValidationError("Este horário já foi reservado por outro aluno.")
            
            self.disponibilidade.disponivel = False
            self.disponibilidade.save()

        # Libera o horário se cancelado
        if self.status == 'CANCELADO':
            self.disponibilidade.disponivel = True
            self.disponibilidade.save()
            
        super().save(*args, **kwargs)

    def __str__(self):
        disc_nome = self.disponibilidade.disciplina.nome if self.disponibilidade.disciplina else "Geral"
        return f"Aula de {disc_nome} - {self.aluno} com {self.disponibilidade.professor}"

class Certificado(models.Model):
    agendamento = models.OneToOneField(Agendamento, on_delete=models.CASCADE)
    codigo_validacao = models.CharField(max_length=64, unique=True)
    data_emissao = models.DateTimeField(auto_now_add=True)
    horas = models.DecimalField(max_digits=4, decimal_places=2, default=1.0)

    def __str__(self):
        return f"Certificado {self.codigo_validacao}"
    
class Avaliacao(models.Model):
    agendamento = models.OneToOneField(Agendamento, on_delete=models.CASCADE)
    nota = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comentario = models.TextField(blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Avaliação"
        verbose_name_plural = "Avaliações"

    def __str__(self):
        return f"Avaliação nota {self.nota} para {self.agendamento}"