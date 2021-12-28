from contextlib import contextmanager
from django.core.exceptions import ValidationError


class ValidationErrorTestingMixin:

    @contextmanager
    def assert_validation_error(self, fields):
        try:
            yield
            raise AssertionError("ValidationError not raised")
        except ValidationError as e:
            for field in fields:
                assert field in e.message_dict