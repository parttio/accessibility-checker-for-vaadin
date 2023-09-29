package org.vaadin.addons.accessibility.cases;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Main;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouteAlias;
import org.vaadin.addons.accessibility.MainLayout;

/**
 * @author jcgueriaud
 */
@PageTitle("Demo application for accessibility")
@RouteAlias(value = "", layout = MainLayout.class)
@Route(value = "index", layout = MainLayout.class)
public class IndexView extends Div {

    public IndexView() {
        add(new Span("Explanation"));
    }
}
