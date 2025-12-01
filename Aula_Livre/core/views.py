from rest_framework import viewsets
from .models import Disciplina, Agendamento, Avaliacao
from .serializers import DisciplinaSerializer, AgendamentoSerializer, AvaliacaoSerializer

class DisciplinaViewSet(viewsets.ModelViewSet):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer

class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer


class AvaliacaoViewSet(viewsets.ModelViewSet):
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer

    # Permite filtrar por professor pela URL: /api/avaliacoes/?professor_id=1
    def get_queryset(self):
        queryset = Avaliacao.objects.all()
        professor_id = self.request.query_params.get('professor_id')
        
        if professor_id:
            # Navega: agendamento -> disponibilidade -> professor
            queryset = queryset.filter(agendamento__disponibilidade__professor_id=professor_id)
            
        return queryset

