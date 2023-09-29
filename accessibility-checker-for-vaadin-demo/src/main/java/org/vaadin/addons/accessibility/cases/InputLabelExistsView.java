package org.vaadin.addons.accessibility.cases;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.vaadin.addons.accessibility.MainLayout;

@PageTitle("input_label_exists")
@Route(value = "input_label_exists", layout = MainLayout.class)
public class InputLabelExistsView extends Div {

    public InputLabelExistsView() {
        TextField textField = new TextField();
        add(textField);
    }
}