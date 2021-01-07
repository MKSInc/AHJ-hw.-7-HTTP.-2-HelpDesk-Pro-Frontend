/* eslint-disable no-console */
import helpDeskHTML from '../html/help-desk.html';

export default class HelpDesk {
  constructor(parentEl) {
    this.parent = parentEl;
    this.els = {
      helpDesk: null,
    };

    this.selectors = {
      helpDesk: '[data-widget="help-desk"]',
    };
  }

  async init() {
    console.log(this.parent);
    this.parent.insertAdjacentHTML('beforeend', helpDeskHTML);

    this.els.helpDesk = this.parent.querySelector(this.selectors.helpDesk);
    console.log('HelpDesk This:', this);
    // this.createRequest({ method: 'GET', params: { method: 'allTickets' } });
    const data = await this.createRequest({ params: { method: 'allTickets' } });
    console.log('Data:', data);
  }

  // eslint-disable-next-line class-methods-use-this
  getURLParams(params) {
    const urlParams = new URLSearchParams();
    urlParams.append('method', params.method);
    if (params.id) urlParams.append('id', params.id);
    return `/?${urlParams}`;
  }

  createRequest({ params, formData }) {
    console.log('createRequest start');
    return new Promise((resolve, reject) => {
      if (params && formData) reject(new Error('(MKS) createRequest method takes only one argument: \'params\' or \'formData\' !'));

      const URL = 'http://localhost:3000';
      const xhr = new XMLHttpRequest();

      let method = 'GET';
      let urlParams = '';

      if (params) urlParams = this.getURLParams(params);
      else if (formData) method = 'POST';

      console.log('URL:', URL + urlParams);

      xhr.open(method, URL + urlParams);

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.response);
            console.log(data);
            resolve(data);
          } catch (e) {
            console.error(e);
            reject(e);
          }
        } else reject(new Error(`(MKS) ${xhr.status}: ${xhr.responseText}`));
      });

      xhr.addEventListener('error', () => reject(new Error('(MKS) Connection error!')));

      xhr.send(formData);
    });
  }
}
