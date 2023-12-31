package org.vaadin.addons.accessibility.cases;

import com.vaadin.flow.component.formlayout.FormLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;

@PageTitle("skip_main_exists")
@Route("skip_main_exists")
public class SkipMainExistsView extends FormLayout {

    public SkipMainExistsView() {
        TextField textField = new TextField();
        textField.setLabel("label for input");
        add(textField);
    }
}