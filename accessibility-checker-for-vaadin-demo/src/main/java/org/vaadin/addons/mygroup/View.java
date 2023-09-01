package org.vaadin.addons.mygroup;

import com.vaadin.flow.component.dependency.JavaScript;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.Route;

@Route("")
public class View extends VerticalLayout {

    public View() {
        TextField axaInputText = new TextField();
        //<accessibility-plugin-label>
        axaInputText.setLabel("test 898");
        //<accessibility-plugin-aria-label>
        axaInputText.setAriaLabel("aria-label-test");
        add(axaInputText);
    }
}
