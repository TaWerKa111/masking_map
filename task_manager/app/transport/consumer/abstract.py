from abc import ABC, abstractmethod


class ConsumerAbc(ABC):
    """abstract class"""

    @abstractmethod
    def on_task(self, task):
        pass

    @abstractmethod
    def connect(self):
        pass

    @abstractmethod
    def ack(self, task):
        pass

    @abstractmethod
    def reject(self, task):
        pass

    @abstractmethod
    def start(self):
        pass

    @abstractmethod
    def stop(self):
        pass
