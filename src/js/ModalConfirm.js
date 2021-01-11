import modalConfirmHTML from '../html/modal-confirm.html';
import Modal from './Modal';

export default class ModalConfirm extends Modal {
  constructor() {
    super(modalConfirmHTML);
  }

  onFormSubmit(event) {
    super.onFormSubmit(event);
    this.hide('delete');
  }
}
