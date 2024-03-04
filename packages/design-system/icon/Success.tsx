import * as React from "react";

import Svg, { Path, SvgProps } from "react-native-svg";

function SvgSuccess(props: SvgProps) {
  return (
    <Svg width={95} height={94} viewBox="0 0 95 94" fill="none" {...props}>
      <Path
        d="M35.601 18.66a6.73 6.73 0 00-6.302-1.843 6.86 6.86 0 00-4.973 4.373L1.218 84.683a6.902 6.902 0 006.43 9.174 7.33 7.33 0 002.359-.386l63.492-23.108a6.858 6.858 0 004.373-4.973 6.73 6.73 0 00-1.843-6.302L35.6 18.661zM15.581 65.22l8.23-22.636 28.295 28.295-22.636 8.231-13.89-13.89zm41.241-37.641c.063-2.32.619-4.6 1.63-6.688 2.272-4.544 6.559-7.031 12.09-7.031 2.872 0 4.715-.986 5.873-3.087.59-1.19.925-2.489.986-3.815a3.389 3.389 0 013.43-3.387A3.43 3.43 0 0184.26 7c0 5.53-3.644 13.718-13.719 13.718-2.872 0-4.716.986-5.873 3.087a9.56 9.56 0 00-.986 3.816 3.387 3.387 0 01-3.43 3.387 3.43 3.43 0 01-3.43-3.43zM46.533 13.859V3.569a3.43 3.43 0 116.86 0v10.29a3.43 3.43 0 11-6.86 0zm43.6 35.283a3.473 3.473 0 010 4.887 3.515 3.515 0 01-4.887 0l-6.86-6.859a3.473 3.473 0 014.888-4.887l6.86 6.86zm2.058-18.306l-10.289 3.43c-.344.119-.707.177-1.072.171a3.43 3.43 0 01-1.072-6.688l10.29-3.43a3.429 3.429 0 013.308 5.859 3.428 3.428 0 01-1.165.658z"
        fill={props.color}
      />
    </Svg>
  );
}

export default SvgSuccess;
