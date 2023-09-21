package org.vaadin.addons.accessibility;

import com.vaadin.flow.component.html.Image;
import com.vaadin.flow.component.html.Main;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;

@PageTitle("img_alt_valid")
@Route("img_alt_valid")
public class ImgAltValidView extends Main {

    public ImgAltValidView() {
        Image image = new Image();
        image.setSrc("icons/icon.png");
        add(image);
    }
}