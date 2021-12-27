from django.urls import reverse
# import pdb


class TestFretboardExerciseViews:

    def test_note_xhr(self, client):
        url = reverse('new_note')
        response = client.get(url)

