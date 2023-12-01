package org.vaadin.addons.accessibility;

/*-
 * #%L
 * accessibility-checker-for-vaadin
 * %%
 * Copyright (C) 2023 Add-on Author Name
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */

import com.vaadin.base.devserver.DevToolsInterface;
import com.vaadin.base.devserver.DevToolsMessageHandler;
import com.vaadin.base.devserver.IdeIntegration;
import com.vaadin.base.devserver.editor.Editor;
import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;
import com.vaadin.flow.component.internal.ComponentTracker;
import com.vaadin.flow.dom.Element;
import com.vaadin.flow.server.VaadinService;
import com.vaadin.flow.server.VaadinSession;
import com.vaadin.flow.server.startup.ApplicationConfiguration;
import elemental.json.Json;
import elemental.json.JsonObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * @author jcgueriaud
 */
@NpmPackage(value = "accessibility-checker", version = "3.1.64")
@NpmPackage(value = "accessibility-checker-engine", version = "3.1.64")
@JsModule(value = "./accessibility-checker/accessibility-checker.ts", developmentOnly = true)
public class AccessibilityCheckerPlugin implements DevToolsMessageHandler {

    public static final String ACCESSIBILITY_CHECKER = "accessibility-checker";
    public static final String NODE_ID = "nodeId";
    public static final String UI_ID = "uiId";

    private IdeIntegration ideIntegration;
    private AccessibilityJavaSourceModifier accessibilityJavaSourceModifier;

    public AccessibilityCheckerPlugin() {

    }

    @Override
    public void handleConnect(DevToolsInterface devToolsInterface) {
        devToolsInterface.send(ACCESSIBILITY_CHECKER + "-init", Json.createObject());
    }

    @Override
    public boolean handleMessage(String command, JsonObject data, DevToolsInterface devToolsInterface) {
        if (command.equals(ACCESSIBILITY_CHECKER + "-show-component-creation-location")) {
            int nodeId = (int) data.getNumber(NODE_ID);
            int uiId = (int) data.getNumber(UI_ID);
            VaadinSession session = VaadinSession.getCurrent();
            session.access(() -> {
                Element element = session.findElement(uiId, nodeId);
                Optional<Component> c = element.getComponent();
                if (c.isPresent()) {
                    getIdeIntegration().showComponentCreateInIde(c.get());
                } else {
                    System.out.println(
                            "Only component locations are tracked. The given node id refers to an element and not a component");
                }
            });
            return true;
        } else if (command.equals(ACCESSIBILITY_CHECKER + "-set-label")) {
            int nodeId = (int) data.getNumber(NODE_ID);
            int uiId = (int) data.getNumber(UI_ID);
            String label = data.getString("label");
            getAccessibilityJavaSourceModifier().setLabel(devToolsInterface, uiId, nodeId, label);
            return true;
        } else if (command.equals(ACCESSIBILITY_CHECKER + "-set-aria-label")) {
            int nodeId = (int) data.getNumber(NODE_ID);
            int uiId = (int) data.getNumber(UI_ID);
            String label = data.getString("label");
            getAccessibilityJavaSourceModifier().setAriaLabel(devToolsInterface, uiId, nodeId, label);
            return true;
        } else if (command.equals(ACCESSIBILITY_CHECKER + "-set-title")) {
            int nodeId = (int) data.getNumber(NODE_ID);
            int uiId = (int) data.getNumber(UI_ID);
            String value = data.getString("title");
            getAccessibilityJavaSourceModifier().setTitle(devToolsInterface, uiId, nodeId, value);
            return true;
        } else if (command.equals(ACCESSIBILITY_CHECKER + "-set-alt-text")) {
            int nodeId = (int) data.getNumber(NODE_ID);
            int uiId = (int) data.getNumber(UI_ID);
            String label = data.getString("text");
            getAccessibilityJavaSourceModifier().setAltText(devToolsInterface, uiId, nodeId, label);
            return true;
        } else if (command.equals(ACCESSIBILITY_CHECKER + "-update-page-title")) {
            int uiId = (int) data.getNumber(UI_ID);
            String label = data.getString("label");
            getAccessibilityJavaSourceModifier().setPageTitle(devToolsInterface, uiId, label);
            return true;
        } else if (command.equals(ACCESSIBILITY_CHECKER + "-update-route-extends")) {
            int uiId = (int) data.getNumber(UI_ID);
            getAccessibilityJavaSourceModifier().updateRouteExtends(devToolsInterface,uiId);
            return true;
        } else if (command.equals(ACCESSIBILITY_CHECKER + "-show-route")) {

            int uiId = (int) data.getNumber(UI_ID);
            VaadinSession session = VaadinSession.getCurrent();
            session.access(() -> {
                Component currentView = session.getUIById(uiId).getCurrentView();
                if (currentView != null) {
                    getIdeIntegration().showComponentCreateInIde(currentView);
                } else {
                    System.out.println(
                            "Only component locations are tracked. The given node id refers to an element and not a component");
                }
            });
            return true;
        }
        return false;
    }

    private IdeIntegration getIdeIntegration() {
        if (ideIntegration == null) {
            this.ideIntegration = new IdeIntegration(
                    ApplicationConfiguration.get(VaadinService.getCurrent().getContext()));
        }
        return ideIntegration;
    }

    private AccessibilityJavaSourceModifier getAccessibilityJavaSourceModifier() {
        if (accessibilityJavaSourceModifier == null) {
            this.accessibilityJavaSourceModifier = new AccessibilityJavaSourceModifier(
                    VaadinService.getCurrent().getContext(),
                    (devToolsInterface, errorMessage) -> {
                        JsonObject object = Json.createObject();
                        object.put("message", errorMessage);
                        devToolsInterface.send(ACCESSIBILITY_CHECKER + "-error", object);
                    },
                    (devToolsInterface) -> {
                        JsonObject object = Json.createObject();
                        devToolsInterface.send(ACCESSIBILITY_CHECKER + "-success", object);
                    }
            );
        }
        return accessibilityJavaSourceModifier;
    }
}
