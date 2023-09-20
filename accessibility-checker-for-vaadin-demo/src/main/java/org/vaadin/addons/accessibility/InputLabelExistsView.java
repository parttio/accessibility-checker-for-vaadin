package org.vaadin.addons.accessibility;

import com.vaadin.flow.component.html.Main;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;

@PageTitle("input_label_exists")
@Route("input_label_exists")
public class InputLabelExistsView extends Main {

    public InputLabelExistsView() {
        TextField textField = new TextField();
        add(textField);
    }
}