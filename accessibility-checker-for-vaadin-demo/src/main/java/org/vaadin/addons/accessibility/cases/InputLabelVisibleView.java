package org.vaadin.addons.accessibility.cases;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.vaadin.addons.accessibility.MainLayout;

@PageTitle("input_label_visible")
@Route(value = "input_label_visible", layout = MainLayout.class)
public class InputLabelVisibleView extends Div {

    public InputLabelVisibleView() {
        TextField textField = new TextField();
        textField.setAriaLabel("Invisible label");
        add(textField);
    }
}