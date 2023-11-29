package org.vaadin.addons.accessibility.cases;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.Route;
import org.vaadin.addons.accessibility.MainLayout;

@Route(value = "page_title_exists", layout = MainLayout.class)
public class PageTitleExistsView extends Div {

    public PageTitleExistsView() {
        TextField textField = new TextField("Test");
        add(textField);
    }
}
