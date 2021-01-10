import Modal from './Modal';
import modalTicketHTML from '../html/modal-ticket.html';
import HiddenTempEl from './utility';

export default class ModalTicket extends Modal {
  constructor() {
    super();
    this.els = {
      modal: null,
      form: null,
      title: null,
      nameValue: null,
      descriptionValue: null,
      btnSave: null,
      btnCancel: null,
    };

    this.selectors = {
      modal: '[data-modal="ticket"]',
      form: '[data-modal="form"]',
      title: '[data-modal="title"]',
      nameValue: '[data-name="value"]',
      descriptionValue: '[data-description="value"]',
      btnSave: '[data-action="save"]',
      btnCancel: '[data-action="cancel"]',
    };

    this.init();
  }

  init() {
    let ht = new HiddenTempEl(modalTicketHTML);
    // Инициализировать элементы, повешать события.
    // Создать методы для управления модальным окном.
    this.els.modal = ht.el.querySelector(this.selectors.modal);
    this.els.form = this.els.modal.querySelector(this.selectors.form);
    this.els.title = this.els.form.querySelector(this.selectors.title);
    this.els.nameValue = this.els.form.querySelector(this.selectors.nameValue);
    this.els.descriptionValue = this.els.form.querySelector(this.selectors.descriptionValue);

    this.els.btnSave = this.els.form.querySelector(this.selectors.btnSave);
    this.els.btnSave.addEventListener('click', this.onBtnSaveClick.bind(this));

    this.els.btnCancel = this.els.form.querySelector(this.selectors.btnCancel);
    this.els.btnCancel.addEventListener('click', this.onBtnCancelClick.bind(this));

    document.body.append(this.els.modal);
    ht.el.remove();
    ht = null;
  }

  // eslint-disable-next-line class-methods-use-this
  onBtnSaveClick() {

  }

  // eslint-disable-next-line class-methods-use-this
  onBtnCancelClick() {

  }

  async show(ticket) {
    if (ticket) {
      this.els.title.textContent = 'Edit Ticket';
      this.els.nameValue.value = ticket.name;
      this.els.descriptionValue.value = ticket.description;
    } else this.els.title.textContent = 'Add Ticket';

    this.docContainerShade();
    this.els.modal.removeAttribute('data-visibility');
    this.els.nameValue.focus();
  }
}
