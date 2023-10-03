package org.vaadin.addons.accessibility;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.HasElement;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.sidenav.SideNav;
import com.vaadin.flow.component.sidenav.SideNavItem;
import com.vaadin.flow.router.*;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * @author jcgueriaud
 */
public class MainLayout extends Div implements RouterLayout, AfterNavigationObserver {

    private final Aside aside;
    private final IFrame iframe;
    private final Main main;
    private final H1 mainTitle;

    public MainLayout() {
        addClassName("main-layout");
        add(buildNav());
        iframe = new IFrame();
        H2 h2 = new H2("Accessibility Help");
        h2.setId("accessibility-help");
        aside = new Aside(h2, iframe);
        iframe.getElement().setAttribute("aria-labelledby", "accessibility-help");
        main = new Main();
        mainTitle = new H1("test");
        main.add(new Header(mainTitle));
        add(main);
        add(aside);
    }

    private Component buildNav() {

        SideNav nav = new SideNav();
        List<RouteData> routes = RouteConfiguration.forSessionScope().getAvailableRoutes();
        List<RouteData> myRoutes = routes.stream()
                .filter(routeData -> MainLayout.class.equals((routeData.getParentLayout())))
                .sorted(Comparator.comparing(RouteBaseData::getTemplate))
                .toList();
        for (RouteData myRoute : myRoutes) {
            nav.addItem(new SideNavItem(myRoute.getTemplate(), myRoute.getNavigationTarget()));
        }
        return nav;
    }

    @Override
    public void showRouterLayoutContent(HasElement content) {
        if (content != null) {
            main.getElement().appendChild(Objects.requireNonNull(content.getElement()));
        }
    }

    @Override
    public void afterNavigation(AfterNavigationEvent afterNavigationEvent) {
        String firstSegment = afterNavigationEvent.getLocation().getFirstSegment();
        if (firstSegment.equals("index") || firstSegment.isEmpty()) {
            aside.setVisible(false);
        } else {
            aside.setVisible(true);
            iframe.setSrc("frontend/accessibility-checker/help/en-US/" + firstSegment + ".html");
        }
        // update the main header of the page
        getUI().ifPresent(ui -> {
            PageTitle pageTitle = ui.getCurrentView().getClass().getAnnotation(PageTitle.class);
            if (pageTitle != null) {
                mainTitle.setText(pageTitle.value());
            }
        });
    }

}