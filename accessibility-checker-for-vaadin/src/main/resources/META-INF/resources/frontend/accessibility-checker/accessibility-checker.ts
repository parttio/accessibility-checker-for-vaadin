import {html, css, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {
    eRuleConfidence,
    eRulePolicy,
    RuleDetails
} from "accessibility-checker/lib/api/IEngine";
// @ts-ignore
import {runAccessibilityCheck} from "./accessibility-checker-lib.js";
import {ComponentReference, getComponents} from "./copy-component-util";

import type {
    DevToolsInterface,
    DevToolsPlugin,
    MessageHandler,
    ServerMessage,
    VaadinDevTools
} from 'Frontend/generated/jar-resources/vaadin-dev-tools/vaadin-dev-tools';
import {injectGlobalCss} from "./copy-styles";
import {ThemeEditor} from "Frontend/generated/jar-resources/vaadin-dev-tools/theme-editor/editor";


injectGlobalCss(css`
  .vaadin-accessibility-checker-highlight {
    outline: solid 2px #9e2cc6;
    outline-offset: 3px;
  }
`);

let devTools: DevToolsInterface;

@customElement('accessibility-checker')
export class AccessibilityChecker extends LitElement implements MessageHandler {

    static styles = css`
      .container {
        display: flex;
        flex-direction: column;
        max-height:50vh;
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
        margin-bottom: 0.5rem;
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
        background: rgba(0,0,0,0.1);
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
        font-size: calc( var(--dev-tools-font-size-small) * 1);
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
        flex-grow:1;
      }
    `;

    @property()
    report?: RuleDetails[];

    @property()
    detail?: RuleDetails;

    @property()
    indexDetail?: number;

    @property()
    errorMessage?: string;

    private node: Node | null = null;

    private debugMode = false;

    /** Ignored rule id, preferably to be configured and loaded in the init method **/
    ignoredRules: IgnoredRule[] = [
        {htmlTag: "vaadin-dev-tools"},
        {htmlTag: "vite-plugin-checker-error-overlay"},
        {htmlTag: "vaadin-connection-indicator"},
        {htmlTag: "iframe", lastTag: false},
        {ruleId: "style_before_after_review"},
        {ruleId: "style_highcontrast_visible"},
        {ruleId: "input_fields_grouped"}, // is it really needed to group them with a fieldset
        {ruleId: "style_color_misuse", htmlTag: "style"},
        {ruleId: "table_aria_descendants", htmlTag: "vaadin-grid"}, // maybe the filter could be different
        {ruleId: "input_label_before", htmlTag: "vaadin-text-field"}, // that's a false positive, the label is before the input
        {ruleId: "list_structure_proper", htmlTag: "vaadin-side-nav"},
        {ruleId: "aria_child_valid", htmlTag: "vaadin-side-nav"} // the children "li" are not detected for the ul inside the shadow root of the vaadin-side-nav
    ];


    async runTests() {
        const accessibilityCheckResult = await runAccessibilityCheck(document);
        const start = new Date().getTime();
        // Remove passing issues
        accessibilityCheckResult.results = accessibilityCheckResult.results.filter(
            (issue: RuleDetails) => {
                return this.validateRuleDetails(issue);
            }
        );
        const duration = new Date().getTime() - start;
        if (duration > 500) {
            console.error(`Time elapsed ${duration / 1000}s`);
        } else {
            console.debug(`Time elapsed ${duration / 1000}s`);
        }
        this.report = accessibilityCheckResult.results;
    }

    openIde(node:Node) {
        const component = this.getComponentForNode(node);
        if (component !== undefined) {
            const serializableComponentRef: ComponentReference = {nodeId: component.nodeId, uiId: component.uiId};
            devTools.send(`${AccessibilityChecker.NAME}-show-component-creation-location`, serializableComponentRef);
        } else {
            // Open the Route class
            const uiId = this.getUiId();
            devTools.send(`${AccessibilityChecker.NAME}-show-route`, {
                uiId: uiId
            });
        }
    }

    backToList() {
        if (this.indexDetail && this.report) {
            this.resetHighlight(this.report[this.indexDetail].node);
        }
        this.indexDetail = undefined;
    }

    back() {
        if (this.indexDetail && this.report) {
            this.resetHighlight(this.report[this.indexDetail].node);
        }
        if (this.indexDetail) {
            this.indexDetail--;
        } else {
            if (this.report) {
                this.indexDetail = this.report.length - 1;
            }
        }

        if (this.indexDetail && this.report) {
            this.node = this.report[this.indexDetail].node;
            this.highlight(this.node);
        }
    }
    next() {
        if (this.indexDetail !== undefined && this.report) {
            this.resetHighlight(this.report[this.indexDetail].node);
        }
        if (this.indexDetail !== undefined && this.report && this.indexDetail < this.report.length - 1) {
            this.indexDetail++;
        } else {
            this.indexDetail = 0;
        }

        if (this.report) {
            this.node = this.report[this.indexDetail].node;
            this.highlight(this.node);
        }
    }

    private highlight(node:Node | null) {
        if (node) {
            const elementForNode = this.getElementForNode(node);
            if (elementForNode) {
                elementForNode.classList.add('vaadin-accessibility-checker-highlight');
            }
        }
    }

    private resetHighlight(node:Node | null) {
        if (node) {
            const elementForNode = this.getElementForNode(node);
            if (elementForNode) {
                elementForNode.classList.remove('vaadin-accessibility-checker-highlight');
            }
        }
    }

    activate() {
        this.report = undefined;
        this.detail = undefined;
        this.indexDetail = undefined;
        this.node = null;
        const vaadinDevTool = (document.getElementsByTagName('vaadin-dev-tools')[0] as VaadinDevTools);
        vaadinDevTool.disableJavaLiveReload();
    }

    deactivate() {
        if (this.node) {
            this.resetHighlight(this.node);
        }
        const vaadinDevTool = (document.getElementsByTagName('vaadin-dev-tools')[0] as VaadinDevTools);
        vaadinDevTool.enableJavaLiveReload();
    }
    render() {
        if (this.indexDetail !== undefined) {
            if (this.report) {
                return this.renderDetail(this.report![this.indexDetail]);
            } else {
                return html``;
            }
        } else {
            return html`
                ${this.report
                        ? html`<div class="container">
                            <div class="issue-summary">
                              <span>
                                ${this.report.length} issues
                              </span>

                                <span>
                                  ${this.getIcon(eRuleIcon.VIOLATION)}
                                  ${this.report.filter((issues: RuleDetails) => this.getRuleIcon(issues.value[0],issues.value[1]) == eRuleIcon.VIOLATION).length}
                                  violations
                              </span>
                                <span>
                                  ${this.getIcon(eRuleIcon.NEED_REVIEW)}
                                   ${this.report.filter((issues: RuleDetails) => this.getRuleIcon(issues.value[0],issues.value[1]) == eRuleIcon.NEED_REVIEW).length}
                                  need review
                              </span>
                                <span>
                                  ${this.getIcon(eRuleIcon.RECOMMENDATION)}
                                  ${this.report.filter((issues: RuleDetails) => this.getRuleIcon(issues.value[0],issues.value[1]) == eRuleIcon.RECOMMENDATION).length}
                                  recommendations
                              </span>
                                <button class="button" @click=${this.runTests}>Re-run Check</button>
                            </div>
                            <ul class="result-list">
                                ${this.report.map((item, index) => this.renderItem(item, index))}
                            </ul>
                        </div>
                        `
                        : html`<div class="issue-summary">
                            Click "Run check" to start the accessibility assessment.
                            <button class="button" @click=${this.runTests}>Run Check</button>
                        </div>
                        `}
            `;

        }
    }


    renderItem(issue:RuleDetails, index:number) {

        const component = this.getComponentForNode(issue.node);
        return html`<li class="result" @click="${() => {
            this.indexDetail = index;
            if (this.report) {
                this.node = this.report[this.indexDetail].node;
                this.highlight(this.node);
            }
        }
        }">
            <p class="text">
                <span class="component">${component?.element?.tagName}</span>
                <span class="warning-message">
                    ${this.getIcon(this.getRuleIcon(issue.value[0], issue.value[1]))}  ${issue.message}
                </span>
            </p>
            ${this.getDetailsIcon()}
        </li>
        `;
    }

    /**
     * Get the component for a node
     * When the node is slotted, it will return the component of the parent element
     * This is ok for a textfield (when the input is faulty) but might lead to other issues
     * That might need to be refined
     * @param node
     */
    private getComponentForNode(node: Node): ComponentReference | undefined {
        const elementForNode = this.getElementForNode(node);
        if (elementForNode) {
            const componentList = getComponents(elementForNode);
            return componentList[componentList.length - 1];
        }
        return undefined;
    }

    private getElementForNode(node: Node) {
        if (node instanceof HTMLElement) {
            const rootNode = node.getRootNode();
            if (rootNode instanceof ShadowRoot) {
                return rootNode.host as HTMLElement;
            } else if (node.parentElement && node.slot == 'input' && node.parentElement.tagName.startsWith("VAADIN")) {
                // the input slot for the textfield is a bit different
                // use the parent element
                return node.parentElement!;
            } else {
                return node;
            }
        }
        return undefined;
    }

    private getUiId() {
        const vaadin = (window as any).Vaadin;
        if (vaadin && vaadin.Flow) {
            const { clients } = vaadin.Flow;
            const appIds = Object.keys(clients);
            for (const appId of appIds) {
                const client = clients[appId];
                if (client.getNodeId) {
                    return client.getUIId();
                }
            }
        }
        return -1;
    }
    renderDetail(issue:RuleDetails) {
        if (this.debugMode) {
            console.debug("Full Issue ", issue);
        }
        const component = this.getComponentForNode(issue.node);
        return html`
            <div class="detail">
                ${(this.errorMessage) ? html`<div class="result error-message">
                    <span>${this.errorMessage}</span>
                    <button class="button" @click="${() => this.clearErrorMessage()}">Clear</button>
                </div>` : html``}
                <div class="result detail-header">
                    <h2 class="component">
                        ${component?.element?.tagName ? html`${component.element.tagName}` : html`Global issue`}</h2>
                    
                        <button class="button" @click="${() => this.openIde(issue.node)}">
                            ${(component?.element) ? html`Open the component in IDE` : html`Open the route in IDE`} 
                        </button>
                </div>

                <div class="detail-actionbar">
                    <button class="nav-button" @click="${() => this.backToList()}">
                        ${this.getBackToListIcon()}
                        Back to list
                    </button>
                    <span class="expand"></span>
                    <button class="nav-button" @click="${() => this.back()}">
                        ${this.getBackIcon()}
                        Previous
                    </button>
                    <button class="nav-button" @click="${() => this.next()}">Next
                        ${this.getNextIcon()}
                    </button>
                </div>

                <div class="section">
                    ${component?.element?.tagName ? html`<h3 class="small-heading lower-case">
                        ${component.element.tagName}</h3>` : html``}

                    <span class="warning-message">
                        ${this.getIcon(this.getRuleIcon(issue.value[0], issue.value[1]))}
                        <span>
                            ${issue.message}
                        </span>
                    </span>
                </div>

                ${(this.generateVaadinDetails(issue))
                }

                <div class="section">
                    <h3 class="small-heading">Help <a
                            href="frontend/accessibility-checker/help/en-US/${issue.ruleId}.html"
                            target="_blank">More details</a></h3>

                    <iframe src="frontend/accessibility-checker/help/en-US/${issue.ruleId}.html" title="Help"></iframe>
                </div>

                <div class="section">
                    <h3 class="small-heading">HTML Snippet</h3>
                    <p>${issue.snippet}</p>
                </div>
            </div>
        `;
    }

    private generateVaadinDetails(issue: RuleDetails) {
        switch (issue.ruleId) {
            case "input_label_visible":
            case "input_label_exists":
                return html`
                    <div class="section">
                        <h3 class="small-heading">Fix issue</h3>

                        <div>
                            <label for="input-label">Enter a label and set either a label or an invisible (Aria)
                                label</label>
                            <input class="text-field" id="input-label"
                                   placeholder="Type label here">
                            <button class="button" @click="${() => this.setLabel(issue.node, '#input-label')}">Set
                                label
                            </button>
                            <button class="button" @click="${() => this.setAriaLabel(issue.node, '#input-label')}">Set
                                aria label
                            </button>
                        </div>
                    </div>`;
            case 'a_text_purpose':
                return html`
                    <div class="section">
                        <h3 class="small-heading">Fix issue</h3>

                        <div>
                            <label for="input-label">Enter an invisible (Aria) label</label>
                            <input class="text-field" id="input-label"
                                   placeholder="Type label here">
                            <button class="button" @click="${() => this.setAriaLabel(issue.node, '#input-label')}">Set
                                aria label
                            </button>
                        </div>
                    </div>`;
            case "page_title_exists":
                return html`
                    <div class="section">
                        <h3 class="small-heading">Fix issue (<a
                                href="https://vaadin.com/docs/latest/routing/page-titles" target="_blank">docs</a>)</h3>

                        <div>
                            <label for="input-page-title">Enter a page title</label>
                            <input class="text-field" id="input-page-title"
                                   placeholder="Type Page Title here">
                            <button class="button" @click="${() => this.setPageTitle('#input-page-title')}">Set page
                                title
                            </button>
                        </div>
                    </div>`;
            case "frame_title_exists":
                return html`
                    <div class="section">
                        <h3 class="small-heading">Fix issue</h3>
                        <div>
                            <label for="input-label">Enter a title for the html component</label>
                            <input class="text-field" id="input-title" placeholder="Type alternative text here">
                            <button class="button" @click="${() => this.setTitle(issue.node, '#input-title')}">Set
                                title
                            </button>
                        </div>
                    </div>`
            case "img_alt_valid":
                return html`
                    <div class="section">
                        <h3 class="small-heading">Fix issue</h3>
                        <div>
                            <label for="input-label">Enter an alternative text for the image or an empty text if it's
                                decorative</label>
                            <input class="text-field" id="input-alt" placeholder="Type alternative text here">
                            <button class="button" @click="${() => this.setAltText(issue.node, '#input-alt')}">Set
                                alternative text
                            </button>
                        </div>
                    </div>`
            case "skip_main_exists":
                // todo detect and display the superclass
                return html`
                    <div class="section">
                        <h3 class="small-heading">Fix issue</h3>

                        <div>
                            This will replace your superclass for the Route to a Main object if the superclass is a Div.
                            <button class="button" @click="${() => this.updateRouteExtends()}">Update the superclass
                            </button>
                        </div>
                    </div>`;
            case "text_contrast_sufficient":

                return html`
                    <div class="section">
                        <h3 class="small-heading">Hint</h3>

                        <div>
                            You can open the component in the theme editor and update the background or foreground color.
                            <button class="button" @click="${() => this.openComponentInThemeEditor(issue.node)}">Open in the theme editor
                            </button>
                            
                        </div>
                    </div>`;
            case "element_tabbable_visible":
            case "aria_hidden_nontabbable":
                const component = this.getComponentForNode(issue.node);
                if (component!.element!.tagName == 'VAADIN-SIDE-NAV') {
                    return html`
                        <div class="section">
                            <h3 class="small-heading">Linked issue</h3>
                            <div>
                                See this <a href="https://github.com/vaadin/web-components/issues/6708" target="_blank">ticket</a>
                            </div>
                        </div>`;
                }
        }
        return nothing;
    }

    private getRuleIcon(rulePolicy: eRulePolicy, ruleConfidence: eRuleConfidence) {
        if (rulePolicy == eRulePolicy.VIOLATION && ruleConfidence == eRuleConfidence.FAIL) {
            return eRuleIcon.VIOLATION;
        }
        if (rulePolicy == eRulePolicy.RECOMMENDATION) {
            return eRuleIcon.RECOMMENDATION;
        }
        if (ruleConfidence == eRuleConfidence.POTENTIAL) {
            return eRuleIcon.NEED_REVIEW;
        }
        return eRuleIcon.RECOMMENDATION

    }

    /**
     * Generate an icon based on the type of the issue
     * @param ruleLevel
     * @private
     */
    private getIcon(rulePolicy: eRuleIcon) {
        switch (rulePolicy) {
            case eRuleIcon.VIOLATION:
                return html`
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM15.25 13.5L13.5 15.25L10 11.75L6.5 15.25L4.75 13.5L8.25 10L4.75 6.5L6.5 4.75L10 8.25L13.5 4.75L15.25 6.5L11.75 10L15.25 13.5Z" fill="#FF3A49"/>
                    </svg>`;
            case eRuleIcon.NEED_REVIEW:
                return html`
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18" fill="none">
                        <path d="M10 0.25L0 17.75H20L10 0.25ZM10 15.25C9.25 15.25 8.75 14.75 8.75 14C8.75 13.25 9.25 12.75 10 12.75C10.75 12.75 11.25 13.25 11.25 14C11.25 14.75 10.75 15.25 10 15.25ZM8.75 11.5V6.5H11.25V11.5H8.75Z" fill="#FFDB7D"/>
                    </svg>`;
            case eRuleIcon.RECOMMENDATION:
                return html`
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM11.25 16.25H8.75V7.5H11.25V16.25ZM11.25 6.25H8.75V3.75H11.25V6.25Z" fill="#57A1F8"/>
                    </svg>`;
            default:
                return html``;
        }
    }

    private getNextIcon() {
        return html`
            <svg class="icon" width="12" height="12" viewBox="0 0 12 12" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
                <path d="M9.00483 5.09089L6.31683 2.0909C6.00483 1.7309 6.02883 1.1549 6.41283 0.818902C6.77283 0.506903 7.34883 0.530903 7.66083 0.914902L11.6688 5.40289C11.9808 5.76289 11.9808 6.26689 11.6688 6.60288L7.66083 11.0909C7.34883 11.4749 6.77283 11.4989 6.41283 11.1629C6.02883 10.8509 6.00483 10.2749 6.31683 9.91488L9.00483 6.89088L0.98883 6.89088C0.50883 6.89088 0.10083 6.50689 0.10083 6.00289C0.10083 5.49889 0.50883 5.09089 0.98883 5.09089L9.00483 5.09089Z"
                      fill="white"/>
            </svg>`;
    }
    private getBackIcon() {
        return html`<svg class="icon" width="12" height="12" viewBox="0 0 12 12" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
            <path d="M2.99517 6.90911L5.68317 9.9091C5.99517 10.2691 5.97117 10.8451 5.58717 11.1811C5.22717 11.4931 4.65117 11.4691 4.33917 11.0851L0.33117 6.59711C0.0191693 6.23711 0.0191694 5.73311 0.33117 5.39711L4.33917 0.909127C4.65117 0.525128 5.22717 0.501128 5.58717 0.837127C5.97117 1.14913 5.99517 1.72512 5.68317 2.08512L2.99517 5.10912L11.0112 5.10912C11.4912 5.10912 11.8992 5.49311 11.8992 5.99711C11.8992 6.50111 11.4912 6.90911 11.0112 6.90911L2.99517 6.90911Z"
                  fill="white"/>
        </svg> `;
    }

    private getBackToListIcon() {
        return html`<svg class="icon" width="20" height="15" viewBox="0 0 20 15" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
            <path d="M0 6.875L7.5 0.75V4.5C7.5 4.5 8.875 4.5 10 4.5C20 4.5 20 14.5 20 14.5C20 14.5 18.75 9.5 10.25 9.5C8.875 9.5 8 9.5 7.5 9.5V13.125L0 6.875H0Z"
                  fill="white"/>
        </svg>`;
    }

    private getDetailsIcon() {
        return html`<svg class="arrow" width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.7" d="M0.25 13.25H2.75L9 7L2.75 0.75H0.25L6.5 7L0.25 13.25Z" fill="white"/>
        </svg>`;
    }


    setLabel(node:Node, id: string) {
        const labelText = (this.renderRoot.querySelector(id) as HTMLInputElement).value;
        const element = node.parentElement;
        // set the label on the client side
        (element as any).label = labelText;
        // set the label on the server side
        const component = this.getComponentForNode(node);
        if (component !== undefined) {
            const serializableComponentRef: ComponentReference = {nodeId: component.nodeId, uiId: component.uiId};
            devTools.send(`${AccessibilityChecker.NAME}-set-label`, {
                nodeId: component.nodeId,
                uiId: component.uiId,
                label: labelText
            });
        }
    }

    setAriaLabel(node:Node, id: string) {
        const labelText = (this.renderRoot.querySelector(id) as HTMLInputElement).value;
        const element = node.parentElement;
        (element as any).accessibleName = labelText;

        const component = this.getComponentForNode(node);
        if (component !== undefined) {
            devTools.send(`${AccessibilityChecker.NAME}-set-aria-label`, {
                nodeId: component.nodeId,
                uiId: component.uiId,
                label: labelText
            });
        }
    }

    setPageTitle(id:string) {
        const title = (this.renderRoot.querySelector(id) as HTMLInputElement).value;
        document.title = title;
        const uiId = this.getUiId();
        devTools.send(`${AccessibilityChecker.NAME}-update-page-title`, {
            label: title,
            uiId: uiId
        });
    }

    updateRouteExtends() {
        const uiId = this.getUiId();
        devTools.send(`${AccessibilityChecker.NAME}-update-route-extends`, {
            uiId: uiId
        });
    }

    // Really hack way of opening the theme editor in the right component
    openComponentInThemeEditor(node:Node) {

        (window as any).Vaadin.devTools.shadowRoot.getElementById('theme-editor').click(); // open the theme editor

        const component = this.getComponentForNode(node);
        if (component !== undefined) {
            const querySelector = (window as any).Vaadin.devTools.shadowRoot.querySelector('vaadin-dev-tools-theme-editor');
            // Open and configure the pickerComponent (set the pickCallback)
            (querySelector as any).pickComponent();
            // close the picker
            (querySelector as ThemeEditor).pickerProvider().close();
            // Select the component
            (querySelector as ThemeEditor).pickerProvider().options!.pickCallback(component);
        }
    }


    setTitle(node:Node, id: string) {
        const text = (this.renderRoot.querySelector(id) as HTMLInputElement).value;
        const element = node as HTMLElement;
        // set the label on the client side
        element.title = text;
        // set the label on the server side
        const component = this.getComponentForNode(node);
        if (component !== undefined) {
            devTools.send(`${AccessibilityChecker.NAME}-set-title`, {
                nodeId: component.nodeId,
                uiId: component.uiId,
                title: text
            });
        }
    }

    setAltText(node:Node, id: string) {
        const text = (this.renderRoot.querySelector(id) as HTMLInputElement).value;
        const element = node as HTMLImageElement;
        // set the label on the client side
        element.alt = text;
        // set the label on the server side
        const component = this.getComponentForNode(node);
        if (component !== undefined) {
            devTools.send(`${AccessibilityChecker.NAME}-set-alt-text`, {
                nodeId: component.nodeId,
                uiId: component.uiId,
                text: text
            });
        }
    }
    public static NAME = 'accessibility-checker';

    /**
     * Handle the messages from the server
     *
     * @param message
     */
    handleMessage(message: ServerMessage): boolean {

        if (message.command === `${AccessibilityChecker.NAME}-init`) {
            // add the Javascript only when the plugin is initialized
            const scriptElement = document.createElement("script");
            scriptElement.setAttribute("src", "https://unpkg.com/accessibility-checker-engine@latest/ace.js");
            scriptElement.setAttribute("async", "true");
            document.body.appendChild(scriptElement);
            // Do something
            return true; // Mark the message as handled
        }
        if (message.command === `${AccessibilityChecker.NAME}-error`) {
            console.error(message.data.message);
            this.errorMessage = message.data.message;
            return true; // Mark the message as handled
        }
        return false; // The message was not handled
    }

    clearErrorMessage() {
        this.errorMessage = undefined;
    }

    /**
     * Apply all the ignoring rules to the issue, if one is matching then return false
     * @param issue
     * @private
     */
    private validateRuleDetails(issue: RuleDetails) {
        if (issue.value[1] == "PASS") {
            return false;
        }

        for (let ignoredRule of this.ignoredRules) {
            const ignoredRuleId = (ignoredRule.ruleId == undefined) || (ignoredRule.ruleId == issue.ruleId);
            if (ignoredRuleId) {
                if (ignoredRule.htmlTag == undefined) {
                    // rule ignored and no more rule is applying
                    return false;
                }
                // it fits, check next
                if (ignoredRule.lastTag == undefined) {
                    const ignoredRuleHtmlTag = (issue.path.dom.includes(ignoredRule.htmlTag));
                    if (ignoredRuleHtmlTag) {
                        // console.debug("1 ignoredRuleHtmlTag for {} RULE: {}", issue, ignoredRule);
                        return false; //
                    } // else check the next rule
                } else if (ignoredRule.lastTag) {
                    const ignoredRuleHtmlTag = ((issue.path.dom.includes(ignoredRule.htmlTag)) && (((issue.node  as HTMLElement).tagName === ignoredRule.htmlTag.toUpperCase())));
                    if (ignoredRuleHtmlTag) {
                        // console.debug("2 ignoredRuleHtmlTag for {} RULE: {}", issue, ignoredRule);
                        return false; //
                    } // else check the next rule
                } else {
                    const ignoredRuleHtmlTag = ((issue.path.dom.includes(ignoredRule.htmlTag)) && ((issue.node  as HTMLElement).tagName !== ignoredRule.htmlTag.toUpperCase()));
                    if (ignoredRuleHtmlTag) {
                        // console.debug("3 ignoredRuleHtmlTag for {} RULE: {}", issue, ignoredRule);
                        return false; //
                    } // else check the next rule
                }
            }
        }
        return true;
    }
}

export interface IgnoredRule {
    /**
     * RuleId to ignore
     */
    ruleId?: string;
    /**
     * HTML tag ignored
     */
    htmlTag?: string;
    /**
     * if true the rule will be applied only if it's the last tag
     * if false the rule will be applied only if it's not the last tag (all the children)
     * if empty, the rule will be applied
     * Note the htmlTag is required to use true/false
     */
    lastTag?: boolean;
}

const plugin: DevToolsPlugin = {
    init: function (devToolsInterface: DevToolsInterface): void {
        devTools = devToolsInterface;
        devTools.addTab('Accessibility Checker', AccessibilityChecker.NAME);
    }
};

enum eRuleIcon {
    VIOLATION = "VIOLATION",
    RECOMMENDATION = "RECOMMENDATION",
    NEED_REVIEW = "NEED_REVIEW"
}
(window as any).Vaadin.devToolsPlugins.push(plugin);