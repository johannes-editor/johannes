import BaseDoublyLinkedList from './BaseDoublyLinkedList';
import JNode from './JNode';

class DoublyLinkedList<T extends JNode<T>> extends BaseDoublyLinkedList<T> {

    constructor() {
        super();
    }

    append(node: T): void {

        if (!this.head || !this.tail) {
            this.head = node;
            this.tail = node;
        } else {
            this.tail.setNext(node);
            node.setPrevious(this.tail);

            this.tail = node;
        }

        this.length++;
    }
}

export default DoublyLinkedList;