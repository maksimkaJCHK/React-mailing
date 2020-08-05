import React from 'react';

export default function LastMailng(props) {
  let lastMailing = props.lastMailing;
  let createMarkup = function(x) {
    return {
      __html: x
    };
  };
  if(lastMailing.length) {
    return (
      <div className = 'mailing-form-last col-12'>
        <h3>Прошлые рассылки</h3>
        <ul className = 'list-group'>
        {
          lastMailing.map((el, i) => {
            return (
              <li className = 'list-group-item' key = {el.date.getTime()} >
                <div>
                  Получатели -
                  {
                    el.emails.map((el, count) => {
                      return (
                        <div className = 'mailing-form-tag btn btn-primary' key = { count }>
                          { el.name ? el.name : el.email }
                        </div>
                      )
                    })
                  }
                </div>
                <div>Тема письма - {el.theme}</div>
                <div>
                  Время - 
                  { el.date.getHours() }:
                  { el.date.getMinutes() < 10 ? '0' + el.date.getMinutes() : el.date.getMinutes() }
                </div>
                <div dangerouslySetInnerHTML = { createMarkup(el.content) } />
              </li>
            )
          })
        }
        </ul>
      </div>
    )
  } else {
    return null;
  }
}