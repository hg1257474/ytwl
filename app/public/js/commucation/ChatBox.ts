import React from 'react'
import PropTypes from 'prop-types'
enum MessageType { Text, File, Image }

class ChatBox extends React.Component {
    render() {
        return (<div>
            </div>)
    }
}
ChatBox.propTypes = {
    type:MessageType,
    haveReaded:PropTypes.bool,

}