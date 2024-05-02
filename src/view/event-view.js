import {createElement} from '../render.js';
import {date} from '../utils.js';

const createOffersTemplate = (offers) => `
  <h4 class="visually-hidden">Offers:</h4>
  <ul class="event__selected-offers">
    ${offers.map((offer) => {
    if (offer.mark) {
      return `
          <li class="event__offer">
            <span class="event__offer-title">${offer.title}</span>
              &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </li>`;
    }
  }).join('\n')}
  </ul>`;

const createEventTemplate = (event) => {
  const {type, offers, dateFrom, dateTo} = event;

  const eventDate = date.formatDay(dateFrom);
  const eventDateBrief = date.formatBriefDay(dateFrom);
  const eventStartTime = date.formatOnlyTime(dateFrom);
  const eventStartTimeMachine = date.formatMachineTime(dateFrom);
  const eventEndTime = date.formatOnlyTime(dateTo);
  const eventEndTimeMachine = date.formatMachineTime(dateTo);
  const eventDuration = date.calculateDuration(dateFrom, dateTo);

  let offersBlock = '';
  if (offers.lenght !== 0) {
    offersBlock = createOffersTemplate(offers);
  }

  const FavoriteClassName = event.isFavorite ? 'event__favorite-btn--active' : '';

  return (
    `<li class="trip-events__item">
    <div class="event">
      <time class="event__date" datetime="${eventDate}">${eventDateBrief}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${type} ${event.destination.name}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${eventStartTimeMachine}">${eventStartTime}</time>
          &mdash;
          <time class="event__end-time" datetime="${eventEndTimeMachine}">${eventEndTime}</time>
        </p>
        <p class="event__duration">${eventDuration}</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;
        <span class="event__price-value">${event.basePrice}</span>
      </p>
      ${offersBlock}
      <button class="event__favorite-btn ${FavoriteClassName}" type="button">
        <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path
            d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z" />
        </svg>
      </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
  </li>`);
};

export default class EventView {
  constructor({event}) {
    this.event = event;
  }

  getTemplate() {
    return createEventTemplate(this.event);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }

    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
