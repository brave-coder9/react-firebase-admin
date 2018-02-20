import React, { Component } from 'react'
import { Link, IndexLink, withRouter } from 'react-router'


class NavItem extends Component {

  render () {

    function resolveToLocation(to, router) {

      return typeof to === 'function' ? to(router.location) : to
    }


    const { router } = this.props
    const { index, to, children, ...props } = this.props

    let isActive




    const toLocation = resolveToLocation(to, router)

    /*console.log("toLocation");
    console.log(toLocation);
    console.log("to")
    console.log(to);
    console.log("Is active with is it index"+index);
    console.log(router.isActive(toLocation,index))
    console.log("Is active with no index");
    console.log(router.isActive(to))
    console.log("Here goes the router");
    console.log(router);*/

    var mostObviousCase=router.isActive(toLocation,index);

    if(index){
      //Check if path contains /app
      if(router.location.pathname.indexOf('/app')>-1){
        mostObviousCase=true;
      }
    }

    const LinkComponent = index ?  IndexLink : Link

    return (
      <li className={mostObviousCase ? 'active' : ''}>
        <LinkComponent {...this.props}>{children}</LinkComponent>
      </li>
    )
  }
}

NavItem = withRouter(NavItem)

export default NavItem
