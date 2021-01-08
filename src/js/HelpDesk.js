import helpDeskHTML from '../html/help-desk.html';
import createRequest from './createRequest';
import getTicketRow from './getTicketRow';

export default class HelpDesk {
  constructor(parentEl) {
    this.parent = parentEl;
    this.els = {
      helpDesk: null,
      body: null,
      table: null,
    };

    this.selectors = {
      helpDesk: '[data-widget="help-desk"]',
      body: '[data-id="body"]',
      table: '[data-id="table"]',
    };

    this.ticketsID = new Map();
  }

  async init() {
    this.parent.insertAdjacentHTML('beforeend', helpDeskHTML);

    this.els.helpDesk = this.parent.querySelector(this.selectors.helpDesk);
    this.els.body = this.els.helpDesk.querySelector(this.selectors.body);
    this.els.table = this.els.body.querySelector(this.selectors.table);
    console.log('HelpDesk This:', this);

    try {
      const allTickets = await createRequest({ params: { method: 'allTickets' } });
      console.log('Data:', allTickets);
      this.updateTable(allTickets);
      console.log(this.ticketsID);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  updateTable(allTickets) {
    this.els.table.innerHTML = '';
    const ticketRowEls = [];
    for (const ticket of allTickets) {
      const ticketRowEl = getTicketRow(ticket);
      ticketRowEls.push(ticketRowEl);
      this.ticketsID.set(ticketRowEl, ticket.id);
    }
    console.log('ticketRowEls', ticketRowEls);
    this.els.table.append(...ticketRowEls);
    ticketRowEls.length = 0;
  }
}
