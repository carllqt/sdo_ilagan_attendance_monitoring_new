import React from "react";

const BrandSubtitle = ({ compact = false }) => (
    <>
        <strong>T</strong>ime and <strong>A</strong>ttendance{" "}
        <strong>L</strong>ogging System
        {!compact ? (
            <>
                {" "}
                with <strong>A</strong>utomated Tardiness Computation
            </>
        ) : null}
    </>
);

export default BrandSubtitle;
