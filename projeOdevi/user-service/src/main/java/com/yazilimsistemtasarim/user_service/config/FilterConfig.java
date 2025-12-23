package com.yazilimsistemtasarim.user_service.config;

import com.yazilimsistemtasarim.user_service.security.InternalSignatureFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<InternalSignatureFilter> internalSignatureFilterRegistration(InternalSignatureFilter filter) {
        FilterRegistrationBean<InternalSignatureFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(filter);
        registrationBean.setOrder(1);
        registrationBean.addUrlPatterns("/api/users/*");
        return registrationBean;
    }
}
