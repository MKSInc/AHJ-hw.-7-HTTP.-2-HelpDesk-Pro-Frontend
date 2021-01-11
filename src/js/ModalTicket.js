import Modal from './Modal';
import modalTicketHTML from '../html/modal-ticket.html';

export default class ModalTicket extends Modal {
  constructor() {
    super(modalTicketHTML);
    this.els = {
      ...this.els,
      title: null,
      nameValue: null,
      descriptionValue: null,
    };

    this.selectors = {
      title: '[data-modal="title"]',
      nameValue: '[data-name="value"]',
      descriptionValue: '[data-description="value"]',
    };

    this.init();
  }

  init() {
    this.els.title = this.els.form.querySelector(this.selectors.title);
    this.els.nameValue = this.els.form.querySelector(this.selectors.nameValue);
    this.els.descriptionValue = this.els.form.querySelector(this.selectors.descriptionValue);
  }

  show(ticket) {
    if (ticket) {
      this.els.title.textContent = 'Edit Ticket';
      this.els.nameValue.value = ticket.name;
      this.els.descriptionValue.value = ticket.description;
    } else {
      this.els.form.reset();
      this.els.title.textContent = 'Add Ticket';
    }

    return super.show();
  }

  onFormSubmit(event) {
    super.onFormSubmit(event);
    const formData = new FormData(event.currentTarget);
    this.hide(formData);
  }
}
