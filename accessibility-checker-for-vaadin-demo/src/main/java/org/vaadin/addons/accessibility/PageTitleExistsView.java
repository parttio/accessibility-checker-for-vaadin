package org.vaadin.addons.accessibility;

import com.vaadin.flow.component.html.Main;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.Route;

@Route("page_title_exists")
public class PageTitleExistsView extends Main {

    public PageTitleExistsView() {
        TextField textField = new TextField("Test");
        add(textField);
    }
}
