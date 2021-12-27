from django.urls import reverse
import json
import pdb


class TestFretboardExerciseViews:

    def test_note_xhr(self, client):
        url = reverse('new_note')
        response = client.get(url)
        note_info = json.loads(response.content)
        assert note_info[frequency]
        assert note_info[note]
        assert note_info[string]
        # pdb.set_trace()

