package org.vaadin.addons.accessibility;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.Route;

@Route("demo")
public class DemoView extends Div {

    public DemoView() {
        TextField textField = new TextField();
        add(textField);
    }
}