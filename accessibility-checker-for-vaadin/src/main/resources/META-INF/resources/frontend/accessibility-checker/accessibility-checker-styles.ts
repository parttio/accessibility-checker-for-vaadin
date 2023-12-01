import {css, CSSResult} from 'lit';


export const getStyles = css`
.container {
    display: flex;
    flex-direction: column;
    max-height: 50vh;
}

.error-message {
    color: red;
}

.issue-summary {
    background: #3C3C3C;
    padding: 0.75rem;
    position: sticky;
    top: -0.75rem;
    z-index: 1;
    display: flex;
    gap: 0.25rem;
}

.icon {
    width: 14px;
    height: 14px;
    margin-right: 0.2rem;
}

.issue-summary > span {
    display: inline-flex;
    align-items: center;
    margin-right: 0.5rem;
    vertical-align: middle;
}

.result-list {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: auto;
}

.result {
    border-bottom: 1px solid #3C3C3C;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.section {
    border-bottom: 1px solid #3C3C3C;
    padding: 0.75rem;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
}

.result:hover {
    cursor: pointer;
    background: rgba(0, 0, 0, 0.1);
    transition: background 0.2s;
}

.detail-header {
    padding-top: 0;
    justify-content: space-between;
    gap: 10px;
}

.result .text {
    margin: 0;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    padding-right: 1rem;
}

.result .component:not(:empty) {
    text-transform: lowercase;
    opacity: 0.7;
    margin-bottom: 0.5rem;
    display: inline-flex;
}
h3.component {
    display: inline-flex;
}

.component-tagname {
    flex-grow: 1;
}

.component-solved {
    color: hsl(144, 83%, 44%);
}

.warning-message {
    display: flex;
    line-height: 1.2;
}

.warning-message .icon {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    margin-right: 0.5rem;
}

.result .arrow {
    flex-shrink: 0;
}

button:focus-visible {
    outline: -webkit-focus-ring-color auto 1px;
}

.button {
    all: initial;
    font-family: inherit;
    font-size: var(--dev-tools-text-color-active);
    line-height: 1;
    white-space: nowrap;
    background-color: rgba(255, 255, 255, 0.12);
    color: var(--dev-tools-text-color);
    font-weight: 600;
    padding: 0.25rem 0.375rem;
    border-radius: 0.25rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
}

button.activated-category {
}

button.deactivated-category {
    opacity: 0.6;
    filter: grayscale(1);
}

.text-field {
    background: #3C3C3C;
    border: none;
    padding: 0.2rem;
    border-radius: 4px;
    color: var(--dev-tools-text-color-active);
}

h3.small-heading {
    opacity: 0.7;
    font-weight: normal;
    font-size: var(--dev-tools-font-size);
    margin-top: 0;
}

.detail h2.component:not(:empty) {
    text-transform: lowercase;
    font-size: var(--dev-tools-font-size);
    flex-grow: 1;
}

.nav-button {
    all: initial;
    font-family: inherit;
    font-size: calc(var(--dev-tools-font-size-small) * 1);
    line-height: 1;
    white-space: nowrap;
    color: var(--dev-tools-text-color-active);
    font-weight: 600;
    padding: 0.25rem 0.375rem;
    border-radius: 0.25rem;
    cursor: pointer;
}

.nav-button .icon {
    width: 12px;
    height: 9px;
}

.lower-case {
    text-transform: lowercase;
}

.detail-actionbar {
    background: #3C3C3C;
    margin-inline: -0.75rem;
    padding: 0.75rem;
    display: flex;
    gap: 10px;
}

.expand {
    flex-grow: 1;
}

code {
    user-select: all;
}

.select-filter-tagname {
    margin-left: auto;
    background: #292929;
    border: 0;
    border-radius: 0.25rem;
}

.margin-right {
    margin-right: auto;
}

.no-loading-icon {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 3px;
}

.loading-icon {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, .3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    -webkit-animation: spin 1s ease-in-out infinite;
    margin-right: 3px;
}

@keyframes spin {
    to {
        -webkit-transform: rotate(360deg);
    }
}
@-webkit-keyframes spin {
    to {
        -webkit-transform: rotate(360deg);
    }
}`;