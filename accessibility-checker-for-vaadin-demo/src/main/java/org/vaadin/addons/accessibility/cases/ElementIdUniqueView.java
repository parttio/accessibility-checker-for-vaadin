package org.vaadin.addons.accessibility.cases;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import org.vaadin.addons.accessibility.MainLayout;

@PageTitle("element_id_unique")
@Route(value = "element_id_unique", layout = MainLayout.class)
public class ElementIdUniqueView extends Div {

    public ElementIdUniqueView() {
        TextField textField1 = new TextField("First input with the id vaadin-text-field");
        textField1.setId("vaadin-text-field");
        TextField textField2 = new TextField("Second input with the id vaadin-text-field");
        textField2.setId("vaadin-text-field");
        add(new VerticalLayout(textField1, textField2));
    }
}