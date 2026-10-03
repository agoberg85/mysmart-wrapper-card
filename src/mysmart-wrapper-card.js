import { LitElement, html, css } from 'lit';

class MySmartWrapperCard extends LitElement {
    static get properties() {
        return {
            hass: { type: Object },
            config: { type: Object },
        };
    }

    constructor() {
        super();
        this._cards = [];
    }

    setConfig(config) {
        if (!config) {
            throw new Error("Invalid configuration");
        }

        // Ensure we don't unnecessarily recreate cards if the cards config hasn't changed
        const cardsChanged = JSON.stringify(this.config?.cards) !== JSON.stringify(config.cards);

        this.config = {
            card_style: "",
            column: 1,
            "cell-gap": "var(--custom-layout-card-padding, 8px)",
            cards: [],
            ...config,
        };

        if (cardsChanged || this._cards.length === 0) {
            this._createCards();
        }
    }

    async _createCards() {
        // If the window helpers aren't loaded, try to load them
        let helpers = window.customCards;
        if (window.loadCardHelpers) {
            helpers = await window.loadCardHelpers();
        }

        if (!this.config.cards || !Array.isArray(this.config.cards)) {
            this._cards = [];
            return;
        }

        this._cards = await Promise.all(
            this.config.cards.map(async (cardConfig) => {
                let element;

                try {
                    if (helpers && helpers.createCardElement) {
                        element = helpers.createCardElement(cardConfig);
                    } else {
                        // Very old fallback
                        const tag = cardConfig.type.startsWith("custom:")
                            ? cardConfig.type.substring(7)
                            : `hui-${cardConfig.type}-card`;
                        element = document.createElement(tag);
                        element.setConfig(cardConfig);
                    }

                    if (this.hass) {
                        element.hass = this.hass;
                    }
                } catch (e) {
                    console.error("Error creating card element:", e);
                    element = document.createElement("hui-error-card");
                    if (element.setConfig) {
                        element.setConfig({
                            type: 'error',
                            error: e.message,
                            origConfig: cardConfig
                        });
                    }
                }
                return element;
            })
        );

        this.requestUpdate();
    }

    set hass(hass) {
        this._hass = hass;
        if (this._cards) {
            this._cards.forEach((card) => {
                if (card) {
                    card.hass = hass;
                }
            });
        }
    }

    get hass() {
        return this._hass;
    }

    render() {
        if (!this.config || !this._cards) {
            return html``;
        }

        // Process custom styles for the wrapper
        let customStyle = '';
        if (this.config.card_style) {
            if (typeof this.config.card_style === 'string') {
                customStyle = this.config.card_style;
            } else if (typeof this.config.card_style === 'object') {
                customStyle = Object.entries(this.config.card_style)
                    .map(([key, value]) => `${key}: ${value};`)
                    .join(' ');
            }
        }

        const configuredColumns = Number(this.config.column);
        const columns = Number.isInteger(configuredColumns) && configuredColumns > 0
            ? configuredColumns
            : 1;
        const configuredCellGap = this.config['cell-gap'] ?? this.config.cell_gap;
        const cellGap = typeof configuredCellGap === 'number'
            ? `${configuredCellGap}px`
            : configuredCellGap || 'var(--custom-layout-card-padding, 8px)';

        const layoutStyle = `grid-template-columns: repeat(${columns}, minmax(0, 1fr)); gap: ${cellGap};`;

        return html`
      <div id="wrapper" style="${layoutStyle} ${customStyle}">
        ${this._cards}
      </div>
    `;
    }

    static get styles() {
        return css`
      #wrapper {
        display: grid;
        align-content: start;
      }

      #wrapper > * {
        min-width: 0;
      }
    `;
    }

    // Hook into Home Assistant's native vertical-stack editor for a beautiful UI!
    static async getConfigElement() {
        let cls = customElements.get('hui-vertical-stack-card');
        if (!cls) {
            const helpers = await window.loadCardHelpers();
            helpers.createCardElement({ type: 'vertical-stack', cards: [] });
            await customElements.whenDefined('hui-vertical-stack-card');
            cls = customElements.get('hui-vertical-stack-card');
        }

        const configElement = await cls.getConfigElement();

        const originalSetConfig = configElement.setConfig;
        configElement.setConfig = function (config) {
            originalSetConfig.call(this, {
                type: config.type,
                title: config.title,
                cards: config.cards || [],
            });
            this._config = {
                ...this._config,
                card_style: config.card_style || "",
                column: config.column ?? 1,
                "cell-gap": config['cell-gap'] ?? config.cell_gap ?? "var(--custom-layout-card-padding, 8px)",
            };
        };

        return configElement;
    }

    static getStubConfig() {
        return {
            cards: [],
            column: 1,
            "cell-gap": "var(--custom-layout-card-padding, 8px)",
            card_style: {
                background: "transparent"
            }
        };
    }
}

customElements.define('mysmart-wrapper-card', MySmartWrapperCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "mysmart-wrapper-card",
    name: "MySmart Wrapper",
    preview: true,
    description: "A magical container that wraps other cards and lets you apply custom CSS."
});
