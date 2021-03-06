import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import RouteNumber from './RouteNumber';
import Icon from './Icon';
import { durationToString } from '../util/timeUtils';
import StopCode from './StopCode';
import LegAgencyInfo from './LegAgencyInfo';
import IntermediateLeg from './IntermediateLeg';
import PlatformNumber from './PlatformNumber';
import ItineraryCircleLine from './ItineraryCircleLine';

class TransitLeg extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showIntermediateStops: false,
    };
  }

  stopCode = stopCode => stopCode && <StopCode code={stopCode} />;

  toggleShowIntermediateStops = () => {
    this.setState({ showIntermediateStops: !this.state.showIntermediateStops });
  }

  renderIntermediate() {
    if (this.props.leg.intermediateStops.length > 0 && this.state.showIntermediateStops === true) {
      const stopList = this.props.leg.intermediateStops.map(
        stop => (<IntermediateLeg
          key={stop.gtfsId}
          mode={this.props.mode}
          name={stop.name}
          stopCode={stop.code}
          focusFunction={this.context.focusFunction({ lat: stop.lat, lon: stop.lon })}
        />),
      );
      return <div className="itinerary-leg-container" >{stopList}</div>;
    }
    return null;
  }

  renderMain = () => {
    const originalTime = (
      this.props.leg.realTime &&
      this.props.leg.departureDelay >= this.context.config.itinerary.delayThreshold) &&
      [<br key="br" />, <span key="time" className="original-time">
        {moment(this.props.leg.startTime).subtract(this.props.leg.departureDelay, 's')
          .format('HH:mm')
        }
      </span>];

    const firstLegClassName = this.props.index === 0 ? ' start' : '';
    /* const modeClassName =
      `${this.props.mode.toLowerCase()}${this.props.index === 0 ? ' from' : ''}`;
    */
    const modeClassName = this.props.mode.toLowerCase();
    const StopInfo = ({ stops, leg, toggleFunction }) => {
      const stopCount = (stops && stops.length) || 0;
      const message = (this.state.showIntermediateStops &&
        (<FormattedMessage id="itinerary-hide-stops" defaultMessage="Hide stops" />))
        || (<FormattedMessage
          id="number-of-intermediate-stops"
          values={{
            number: (stops && stops.length) || 0,
          }}
          defaultMessage="{number, plural, =0 {No stops} one {1 stop} other {{number} stops} }"
        />);
      return (
        <div className="intermediate-stop-info-container">{stopCount === 0 ? <span className="intermediate-stop-no-stops">{message}</span> :
        <span className="intermediate-stops-link pointer-cursor" onClick={(event) => { event.stopPropagation(); toggleFunction(); }}>
          {message}
        </span>} <span className="intermediate-stops-duration">({durationToString(leg.duration * 1000)})</span></div>);
    };

    return (<div
      key={this.props.index}
      className="row itinerary-row"
    >
      <div className="small-2 columns itinerary-time-column">
        <Link
          onClick={e => e.stopPropagation()}
          to={
            `/linjat/${this.props.leg.route.gtfsId}/pysakit/${
            this.props.leg.trip.pattern.code}/${this.props.leg.trip.gtfsId}`
            // TODO: Create a helper function for generationg links
          }
        >
          <div className="itinerary-time-column-time">
            <span className={this.props.leg.realTime ? 'realtime' : ''}>
              {this.props.leg.realTime &&
                <Icon img="icon-icon_realtime" className="realtime-icon realtime" />}
              {moment(this.props.leg.startTime).format('HH:mm')}
            </span>{originalTime}
          </div>
          <RouteNumber
            mode={this.props.mode.toLowerCase()}
            text={this.props.leg.route && this.props.leg.route.shortName}
            realtime={this.props.leg.realTime}
            vertical
            fadeLong
          />
        </Link>
      </div>
      <ItineraryCircleLine index={this.props.index} modeClassName={modeClassName} />
      <div
        onClick={this.props.focusAction}
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${modeClassName}`}
      >
        <div className="itinerary-leg-first-row">
          <div>{this.props.leg.from.name}{this.stopCode(
            this.props.leg.from.stop && this.props.leg.from.stop.code)}
            <PlatformNumber number={this.props.leg.from.stop.platformCode} short={false} />
          </div>
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
        <div className="itinerary-transit-leg-route">
          {this.props.children}
        </div>
        <LegAgencyInfo leg={this.props.leg} />
        <div >
          <StopInfo
            toggleFunction={this.toggleShowIntermediateStops}
            leg={this.props.leg}
            stops={this.props.leg.intermediateStops}
          />
        </div>
      </div>
    </div>);
  }

  render() {
    return (
      <div>
        {[].concat([this.renderMain()]).concat([this.renderIntermediate()])}
      </div>);
  }
}

TransitLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  'leg.realTime': PropTypes.bool,
  index: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

TransitLeg.contextTypes = {
  focusFunction: React.PropTypes.func.isRequired,
  config: React.PropTypes.object.isRequired,
};


export default TransitLeg;
