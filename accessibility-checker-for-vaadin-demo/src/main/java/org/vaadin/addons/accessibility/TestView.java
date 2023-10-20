package org.vaadin.addons.accessibility;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.Route;

@Route("test")
public class TestView extends Div {

    public TestView() {
        TextField textField = new TextField();
        add(textField);
    }
}