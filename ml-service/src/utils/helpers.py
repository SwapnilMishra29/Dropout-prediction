"""
Helper utilities
"""
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def log_info(message):
    """Log info message"""
    logger.info(message)


def log_error(message):
    """Log error message"""
    logger.error(message)


def validate_student_data(data):
    """
    Validate student data structure
    """
    required_fields = ['student_id', 'attendance_percentage', 'average_marks']
    return all(field in data for field in required_fields)
