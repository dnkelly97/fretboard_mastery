from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.


def index(request):
    return render(request, 'fretboard_exercises/index.html', {'note': 'high e', 'frequency': 329.6})

