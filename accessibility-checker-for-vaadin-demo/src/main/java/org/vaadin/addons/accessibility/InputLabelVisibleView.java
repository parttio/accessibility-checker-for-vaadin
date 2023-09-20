package org.vaadin.addons.accessibility;

import com.vaadin.flow.component.html.Main;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;

@PageTitle("input_label_visible")
@Route("input_label_visible")
public class InputLabelVisibleView extends Main {

    public InputLabelVisibleView() {
        TextField textField = new TextField();
        textField.setAriaLabel("Invisible label");
        add(textField);
    }
}