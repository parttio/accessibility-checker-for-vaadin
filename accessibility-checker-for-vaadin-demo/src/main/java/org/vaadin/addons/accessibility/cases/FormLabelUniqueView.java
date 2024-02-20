package org.vaadin.addons.accessibility.cases;

import org.vaadin.addons.accessibility.MainLayout;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;

@PageTitle("form_label_unique")
@Route(value = "form_label_unique", layout = MainLayout.class)
public class FormLabelUniqueView extends Div {

    public FormLabelUniqueView() {
        TextField textField = new TextField("Label 1");
        TextField textField2 = new TextField("Label 1");
        add(textField, textField2);
    }
}